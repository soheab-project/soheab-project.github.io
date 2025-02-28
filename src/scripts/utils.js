import { fetchAndCreateBeeldtaalElement } from './beeldtaal.js';
import { fetchAndCreateWoordenschatElement } from './woordenschat.js';
const periodeNaarBestand = {
    "3": "../woordenschat.json",
    "4": "../woordenschat.json",
    "5": "../beeldtaal.json",
};

const periodeNaarFunctie = {
    "3": fetchAndCreateWoordenschatElement,
    "4": fetchAndCreateWoordenschatElement,
    "5": fetchAndCreateBeeldtaalElement,
};

const periodeNaarCSS = {
    "3": "woordenschat",
    "4": "woordenschat",
    "5": "beeldtaal",
};

async function readLocalFile(filePath) {
    try {
        const response = await fetch(filePath);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching or parsing file at ${filePath}:`, error);
        throw error;
    }
}

async function readFile(filePath) {
    if (filePath.startsWith('http://') || filePath.startsWith('https://')) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error(`Error fetching or parsing URL at ${filePath}:`, error);
            throw error;
        }
    } else {
        return await readLocalFile(filePath);
    }
}

/**
 * Fetches JSON data from a list of files, extracts the periods, and returns the options for a select element.
 *
 * @param {string[]} files - An array of file URLs to fetch JSON data from.
 * @returns {Promise<HTMLOptionElement[]>} A promise that resolves to an array of option elements.
 */
async function genereerPeriodeKiezerOptions(files) {
    const data = await Promise.all(files.map(file => readFile(file)));
    console.log("data: ", data);
    const periodes = data.map(file => Object.keys(file["perPeriode"])).flat().sort();
    console.log("periodes: ", periodes);

    const options = periodes.map(periode => {
        const option = document.createElement("option");
        option.value = periode;
        option.innerText = periode;
        return option;
    });

    return options;
}

/**
 * 
 * @param {string} periode 
 * @returns {Promise<HTMLOptionElement[]>}
 */
async function genereerToetsKiezerOptions(periode) {
    let toetsen = await readFile(periodeNaarBestand[periode]);
    const perPeriode = toetsen["perPeriode"];
    console.log(perPeriode,);
    console.log("periode: ", periode);
    if (!perPeriode) {
        throw new Error(`No data found for periode: ${periode}`);
    }
    const lessen = perPeriode[periode];
    const options = Object.keys(lessen).map(les => {
        const optie = document.createElement('option');
        optie.value = lessen[les].join(', ');
        optie.innerText = les;
        return optie;
    });

    return options;
}

/**
 * Generates and displays an exercise based on the selected period and test.
 * 
 * @param {string} periode - The selected period number
 * @param {string|string[]} toetsData - The selected test data
 * @returns {Promise<void>}
 */
async function genereerOefening(periode, toetsData) {
    console.log("periode: ", periode);
    console.log("toetsData: ", toetsData);
    const functie = periodeNaarFunctie[periode];

    if (!functie) {
        console.error(`No function found for periode: ${periode}`);
        return;
    }

    try {
        let elements = [];
        if (periode === "5") {
            const toetsDataArray = Array.isArray(toetsData) ? toetsData : toetsData.split(',').map(item => item.trim());
            for (const data of toetsDataArray) {
                const result = await functie(data);
                elements.push(result.jquery ? result[0] : result);
            }
        } else {
            const result = await functie(periode, toetsData);
            elements.push(result.jquery ? result[0] : result);
        }
        renderElements(elements);
    } catch (error) {
        console.error('Error generating exercise:', error);
    }

}

function renderElements(elements) {
    console.log("elements: ", elements);
    // Replace content after main tag
    const main = document.querySelector('main');
    if (main) {
        // Clear existing content after main, except the footer
        let nextElement = main.nextElementSibling;
        while (nextElement && nextElement.tagName.toLowerCase() !== 'footer') {
            const currentElement = nextElement;
            nextElement = currentElement.nextElementSibling;
            currentElement.remove();
        }

        // Add the new elements before the footer if it exists, otherwise append to body
        const footer = document.querySelector('footer');
        elements.forEach(element => {
            if (element instanceof Node) {
                if (footer) {
                    document.body.insertBefore(element, footer);
                } else {
                    document.body.appendChild(element);
                }
            } else {
                console.error('Element is not a Node:', element);
            }
        });
    } else {
        console.error('Main tag not found in document');
    }
}


export { readLocalFile, readFile, genereerPeriodeKiezerOptions, genereerToetsKiezerOptions, genereerOefening };
