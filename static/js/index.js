let page = 0;
let nextPage = 0;
let keyword;
let apiUrl;


getAttractions(page, keyword);


function getAttractions(page, keyword) {
    if (keyword) {
        apiUrl = `/api/attractions?page=${page}&keyword=${keyword}`;
    } else {
        apiUrl = `/api/attractions?page=${page}`;
    }
    fetch(apiUrl).then(function (response) {
        return response.json();
    }).then((rawData) => {
        console.log(rawData);
        nextPage = rawData['nextPage'];
        dataProcessing(rawData);
    });
};


function dataProcessing(data) {
    let attractions = data['data'];
    if (attractions) {
        let length = attractions.length;
        for (let i = 0; i < length; i++) {
            let attractionContainer = document.createElement('div');
            attractionContainer.classList.add('box');
            attractionContainer.setAttribute('id', 'attractionContent');

            let img = document.createElement('img');
            img.classList.add('image');
            img.src = attractions[i]['images'][0];

            let textBox = document.createElement('div');
            textBox.classList.add('boxText');

            let title = document.createElement('div');
            title.classList.add('imgTitle');

            let info = document.createElement('div');
            info.classList.add('imgInfo');

            let category = document.createElement('div');
            category.classList.add('imgCategory');

            let mrt = document.createElement('div');
            mrt.classList.add('imgMrt');

            info.append(mrt, category);
            textBox.append(title, info);
            attractionContainer.appendChild(img);
            attractionContainer.appendChild(textBox);
            document.getElementById('picSection').appendChild(attractionContainer);


            title.textContent = attractions[i]['name'];
            category.textContent = attractions[i]['category'];
            mrt.textContent = attractions[i]['mrt']
        }
        window.addEventListener('scroll', scrolling)
    } else {
        let attractionContainer = document.createElement('div');
        attractionContainer.classList.add('box');
        attractionContainer.setAttribute('id', 'attractionContent');
        document.getElementById('picSection').appendChild(attractionContainer);
        
        let AttrBox = document.getElementById('attractionContent');

        let noResult = document.createElement('div')
        noResult.classList.add('noData');
        noResult.appendChild(document.createTextNode('查無資訊'));
        console.log(noResult);
        AttrBox.appendChild(noResult);
    }
};


function scrolling() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    // console.log({ scrollTop, scrollHeight, clientHeight});
    if (clientHeight + scrollTop >= scrollHeight - 3.5) {
        console.log('to the bottom');
        //show the loading data
        loading();
        window.removeEventListener('scroll', scrolling);
    }
};


function loading() {
    if (nextPage !== null) {
        page = nextPage;
        console.log(page);
        getAttractions(page, keyword);
    }
};


function searchAttraction(event) {
    event.preventDefault();
    while (document.getElementById('attractionContent')) {
        document.getElementById('attractionContent').remove();
    };
    let keyword = document.getElementById('wordforsearch').value;
    page = 0;
    if (keyword==''){
        return false;
    };
    let NewAttrContainer = document.createElement('div');
    console.log(page, keyword);
    getAttractions(page, keyword);
};