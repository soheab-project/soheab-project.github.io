async function fetchAndCreateBeeldtaalElement(number) {
    console.log("fetchAndCreateBeeldtaalElement number: ", number);
    try {
        const response = await fetch('../beeldtaal.json');
        const data = await response.json();
        const sectionData = data[String(number)];

        const container = $('<div>').addClass('box-container');
        const box = $('<div>').addClass('box');
        const title = $('<h1>').text(sectionData.title);
        const list = $('<ol>').addClass('show');

        sectionData.contents.forEach(item => {
            const li = $('<li>');
            const itemTitle = $('<span>').addClass('title').text(item.title);
            const description = $('<span>').addClass('description show').text(item.description);

            li.append(itemTitle);
            li.append(description);
            list.append(li);

            li.on('click', (function (description) {
                return function (e) {
                    e.stopPropagation();
                    description.toggleClass('show');
                };
            })(description));
        });

        container.append(title);
        box.append(list);
        container.append(box);

        container.on('click', function (e) {
            if ($(e.target).is(container)) {
                list.toggleClass('show');
            }
        });

        return container[0];
    } catch (error) {
        console.error('Error fetching or processing data:', error);
        return $('<div>').addClass('error').text('Er is een fout opgetreden bij het laden van de content.')[0];
    }
}

export { fetchAndCreateBeeldtaalElement };
