fetch("woorden.json")
    .then(response => response.json())
    .then(data => {
        let woorden = data["4"];
        let keys = Object.keys(woorden);
        keys.sort(() => Math.random() - 0.5);
        for (const key of keys) {
            let value = woorden[key];
            let wordsArray = keys.slice();

            wordsArray.sort(() => Math.random() - 0.5);

            let half = Math.ceil(wordsArray.length / 2);
            let firstHalf = wordsArray.slice(0, half).join(', ');
            let secondHalf = wordsArray.slice(half).join(', ');

            $('.woorden p').html(firstHalf + '<br>' + secondHalf);
            let row = document.createElement('tr');
            let cell1 = document.createElement('td');
            let cell2 = document.createElement('td');

            let inp = document.createElement('input');
            inp.setAttribute('type', 'text');
            inp.setAttribute('value', '');
            inp.setAttribute('data-name', key);

            let icon = document.createElement('span');
            icon.textContent = '😅';
            icon.style.cursor = 'pointer';
            icon.title = key;

            cell1.appendChild(icon);
            cell1.appendChild(inp);
            cell2.textContent = value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
            row.appendChild(cell1);
            row.appendChild(cell2);
            document.querySelector('tbody').appendChild(row);

            $(inp).on("input", function () {
                let ID = this.getAttribute('data-name');
                let input = $(this).val();
                let td = $(this).parent().next();
                if (input === ID) {
                    td.css('background-color', 'green');
                    let wordsList = $('.woorden p').html();
                    let updatedWordsList = wordsList.replace(new RegExp(`\\b${ID}\\b`, 'g'), `<s><geel>${ID}</geel></s>`);
                    $('.woorden p').html(updatedWordsList);
                } else {
                    td.css('background-color', 'red');
                }
            });
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
