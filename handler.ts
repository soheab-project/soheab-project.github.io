console.log('Hello from handler.ts');

async function getWoorden(nummer: number): Promise<string[]> {
    const response = await fetch(`woorden.json`);
    const data = await response.json();
    return data[nummer];
}

function toCaseText(_string: string) {
    return _string.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

function toTitleCase(_string: string, _isFirst: boolean) {
    if (_isFirst) {
        return _string.charAt(0).toUpperCase() + _string.slice(1);
    } else {
        return _string.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
    }
}

function updateWoordsList(woord: string, hint: boolean = false, correct: boolean = false, reset: boolean = false) {
    let wordsList = $('.woorden p').html();
    let replace_with: string;
    if (hint) {
        replace_with = `<s><rood>${woord}</rood></s>`;
    } else if (correct) {
        replace_with = `<s><groen>${woord}</groen></s>`;
    } else if (reset) {
        replace_with = woord;
    } else {
        replace_with = woord;
    };


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
};

function markAs(_input: JQuery, correct: boolean = false, incorrect: boolean = false, reset: boolean = false) {
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
};

function getHint(_hint: string) {
    let icon = $(`<span class="icon" title="${_hint}" style="cursor: pointer;"></span>`);
    icon.attr("title", _hint);
    icon.css("display", "block");
    icon.text("Vergeten? Klik hier!");
    icon.on('click', function () {
        console.log('clicked');
        let input = $(this).prev();
        let ID = input.attr('data-name');
        console.log(input,);
        markAs(input, true, false, false);

        if (!ID) {
            return;
        }

        input.val(ID);
        updateWoordsList(ID, true, false, false);
    });
    return icon;
};

async function loadWoorden(nummer: number) {
    $('tbody').html('');
    $('.woorden p').html('');

    const woorden: string[] = await getWoorden(nummer);

    let keys = Object.keys(woorden);

    keys.sort(() => Math.random() - 0.5);
    for (const key of keys) {
        let value = woorden[key];
        let shuffledWords = Array.from(new Set(keys)).sort(() => Math.random() - 0.5);
        let rows: string[] = [];
        let row: string[] = [];
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
    };

    $("input").on("input", function () {
        let ID = this.getAttribute('data-name');
        let input = $(this).val();
        let td = $(this).parent().next();

        console.log(ID, input);
        if (!ID) {
            return;
        };


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
};

async function handleToetsen() {
    const toetsenKiezer = $('.toets-kiezer select');
    const toetsen: number[] = Object.keys(await (await fetch('woorden.json')).json()).map(Number);
    console.log(toetsenKiezer);
    console.log(toetsen);

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
};

jQuery(function () {
    handleToetsen();
    const selectedToets = localStorage.getItem('selectedToets');
    console.log('selectedToets', selectedToets);
    loadWoorden(Number(selectedToets));

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