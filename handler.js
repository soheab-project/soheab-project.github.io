/**
 * Fetches words from a JSON file and returns the word at the specified index.
 * @param {number} nummer - The index of the word to retrieve.
 * @returns {Promise<string>} The word at the specified index.
 */
async function getWoorden(nummer) {
    const response = await fetch(`woorden.json`);
    const data = await response.json();
    return data[nummer];
}

/**
 * Converts a string to title case.
 * @param {string} _string - The string to convert.
 * @returns {string} The converted string.
 */
function toCaseText(_string) {
    return _string.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}

/**
 * Converts a string to title case with an option to capitalize only the first letter.
 * @param {string} _string - The string to convert.
 * @param {boolean} _isFirst - Whether to capitalize only the first letter.
 * @returns {string} The converted string.
 */
function toTitleCase(_string, _isFirst) {
    if (_isFirst) {
        return _string.charAt(0).toUpperCase() + _string.slice(1);
    } else {
        return _string.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }
}

/**
 * Updates the list of words with the specified word and formatting options.
 * @param {string} woord - The word to update.
 * @param {boolean} [hint=false] - Whether to format the word as a hint.
 * @param {boolean} [correct=false] - Whether to format the word as correct.
 * @param {boolean} [reset=false] - Whether to reset the formatting of the word.
 */
function updateWoordsList(woord, hint = false, correct = false, reset = false) {
    let wordsList = $('.woorden p').html();
    let replace_with;
    if (hint) {
        replace_with = `<s><rood>${woord}</rood></s>`;
    } else if (correct) {
        replace_with = `<s><groen>${woord}</groen></s>`;
    } else if (reset) {
        replace_with = woord;
    } else {
        replace_with = woord;
    }

    let updatedWordsList = wordsList.replace(new RegExp(`\\b${woord}\\b`, 'g'), replace_with);
    if (correct) {
        updatedWordsList = updatedWordsList.replace(new RegExp(`<s><rood>${woord}</rood></s>`, 'g'), replace_with);
    } else if (hint) {
        updatedWordsList = updatedWordsList.replace(new RegExp(`<s><groen>${woord}</groen></s>`, 'g'), replace_with);
    } else {
        updatedWordsList = updatedWordsList.replace(new RegExp(`<s><groen>${woord}</groen></s>`, 'g'), replace_with);
        updatedWordsList = updatedWordsList.replace(new RegExp(`<s><rood>${woord}</rood></s>`, 'g'), replace_with);
    }
    $('.woorden p').html(updatedWordsList);
}

/**
 * Marks an input element with the specified formatting options.
 * @param {JQuery} _input - The input element to mark.
 * @param {boolean} [correct=false] - Whether to mark the input as correct.
 * @param {boolean} [incorrect=false] - Whether to mark the input as incorrect.
 * @param {boolean} [reset=false] - Whether to reset the formatting of the input.
 */
function markAs(_input, correct = false, incorrect = false, reset = false) {
    let parent = _input.parent();
    let td = parent.next();
    if (correct) {
        parent.css('background-color', 'green');
        td.css('background-color', 'green');
        _input.next('.icon').remove();
    } else if (incorrect) {
        parent.css('background-color', 'red');
        td.css('background-color', 'red');
    } else if (reset) {
        parent.css('background-color', '');
        td.css('background-color', '');
    }
}

/**
 * Creates a hint icon element with the specified hint text.
 * @param {string} _hint - The hint text to display.
 * @returns {JQuery} The hint icon element.
 */
function getHint(_hint) {
    let icon = $(`<span class="icon" title="${_hint}" style="cursor: pointer;"></span>`);
    icon.attr("title", _hint);
    icon.css("display", "block");
    icon.text("Vergeten? Klik hier!");
    icon.on('click', function () {
        let input = $(this).prev();
        let ID = input.attr('data-name');
        markAs(input, true, false, false);

        if (!ID) {
            return;
        }

        input.val(ID);
        updateWoordsList(ID, true, false, false);
    });
    return icon;
}

/**
 * Loads words from a JSON file and displays them in a table.
 * @param {number} nummer - The index of the words to load.
 */
async function loadWoorden(nummer) {
    $('tbody').html('');
    $('.woorden p').html('');

    const woorden = await getWoorden(nummer);

    let keys = Object.keys(woorden);

    keys.sort(() => Math.random() - 0.5);
    for (const key of keys) {
        let value = woorden[key];
        let shuffledWords = Array.from(new Set(keys)).sort(() => Math.random() - 0.5);
        let rows = [];
        let row = [];
        for (let i = 0; i < shuffledWords.length; i++) {
            row.push(shuffledWords[i]);
            if (row.length === 6 || i === shuffledWords.length - 1) {
                rows.push(row.join(' - '));
                row = [];
            }
        }
        $('.woorden p').html(rows.join('<br>'));

        let trow = $(`<tr>`);
        let tdata = $(`<td>`);
        const _inp = $(`<input type="text" value="" data-name="${key}">`);
        tdata.append(_inp);
        tdata.append(getHint(key));
        trow.append(tdata);
        trow.append(`<td>${toTitleCase(value, true)}</td>`);
        trow.append(`</tr>`);
        $('tbody').append(trow);
    }

    $("input").on("input", function () {
        let ID = this.getAttribute('data-name');
        let input = $(this).val();
        let td = $(this).parent().next();

        if (!ID) {
            return;
        }

        if (td.prev().find('span.icon').length === 0) {
            td.prev().append(getHint(ID));
        }
        input = input?.toString().trim();

        if (!input) {
            markAs($(this), false, false, true);
            updateWoordsList(ID, false, false, true);
            return;
        }

        if (input.trim() === ID.trim()) {
            markAs($(this), true, false, false);
            updateWoordsList(ID, false, true, false);
        } else {
            markAs($(this), false, true, false);
            updateWoordsList(ID, false, false, true);
        }
    });
}

/**
 * Handles the selection of tests and loads the corresponding words.
 */
async function handleToetsen() {
    const toetsenKiezer = $('.toets-kiezer select');
    const toetsen = Object.keys(await (await fetch('woorden.json')).json()).map(Number);

    const selectedToets = localStorage.getItem('selectedToets');

    toetsen.forEach((toets) => {
        let option = $(`<option value="${toets}">Toets ${toets}</option>`);
        if (selectedToets && Number(selectedToets) === toets) {
            option.attr('selected', 'selected');
        }
        toetsenKiezer.append(option);
    });

    toetsenKiezer.on('change', function () {
        let nummer = $(this).val();
        if (!nummer) {
            return;
        }
        localStorage.setItem('selectedToets', nummer.toString());
        loadWoorden(Number(nummer));
    });
}

/**
 * Initializes the application by handling test selection and loading words.
 */
jQuery(function () {
    handleToetsen();
    const selectedToets = localStorage.getItem('selectedToets');
    loadWoorden(Number(selectedToets));
});


document.getElementById('toggle-button').addEventListener('click', function () {
    var content = document.getElementById('woorden-content');
    if (content.style.display === 'none') {
        content.style.display = 'block';
    } else {
        content.style.display = 'none';
    }
});


$("#scroll-button").attr("data-tooltip", 'Scroll naar boven/beneden');
var scrollButton = document.getElementById('scroll-button');

window.addEventListener('scroll', function () {
    if (window.scrollY > window.innerHeight / 2) {
        scrollButton.innerHTML = '&#9650;';
        $('#scroll-button').attr("data-tooltip", 'Scroll naar boven');
    } else {
        scrollButton.innerHTML = '&#9660;';
        $('#scroll-button').attr("data-tooltip", 'Scroll naar beneden');
    }
});

scrollButton.addEventListener('click', function () {
    if (window.scrollY > window.innerHeight / 2) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
});

//
//$(document).ready(function () {
//    const $woorden = $('.woorden');
//    let isMoving = false;
//    let offsetX = 0;
//    let offsetY = 0;
//
//    $woorden.css('position', 'absolute');
//
//    $woorden.on('mousedown', function (e) {
//        isMoving = true;
//        offsetX = e.clientX - $woorden.offset().left;
//        offsetY = e.clientY - $woorden.offset().top;
//        $(document).on('mousemove', onMouseMove);
//        $(document).on('mouseup', onMouseUp);
//    });
//
//    function onMouseMove(e) {
//        if (isMoving) {
//            $woorden.css({
//                left: (e.clientX - offsetX) + 'px',
//                top: (e.clientY - offsetY) + 'px'
//            });
//        }
//    }
//
//    function onMouseUp() {
//        isMoving = false;
//        $(document).off('mousemove', onMouseMove);
//        $(document).off('mouseup', onMouseUp);
//    }
//});