let pathname = window.location.pathname;
let apiUrl=`/api${pathname}`;
console.log(apiUrl);
let radio1forenoon=document.querySelector('input[value=forenoon]');
let radio2afternoon=document.querySelector('input[value=afternoon]');
let rotator=document.querySelector('.rotator');
let nextImg=document.querySelector('#rightArrow');
let prevImg=document.querySelector('.leftArrow');
let slideIndex=1;

getAttractionData();

function getAttractionData(){
    fetch(apiUrl).then(function (response) {
        return response.json();
    }).then((rawData) => {
        console.log(rawData);
        attrDataProcessing(rawData.data);
        attrImgProcessing(rawData.data);
        showslides(slideIndex);
    }).catch((error) => {
        console.log(error);
    });
};

function attrDataProcessing(data){
    let result=data[0]
    let attrName=result.name;
    let attrCategory=result.category;
    let attrMrt=result.mrt;
    let attrDescription=result.description;
    let attrTransport=result.transport;
    let attrAddress=result.address;

    let spotName=document.querySelector('.spotName');
    spotName.textContent=attrName;

    let spotBrief=document.querySelector('.spotBrief')
    if (attrMrt){
        spotBrief.textContent=attrCategory + ' at ' + attrMrt;
    }else{
        spotBrief.textContent=attrCategory;
    }

    let spotDescription=document.querySelector('.spotDescription');
    spotDescription.textContent=attrDescription;

    let spotAddress=document.querySelector('.spotAddress');
    spotAddress.textContent=attrAddress;

    let spotTransport=document.querySelector('.spotTransportation');
    if (attrTransport){
        spotTransport.textContent=attrTransport;
    }else{
        spotTransport.textContent='尚無資料'
    }
};


function attrImgProcessing(data){
    let result=data[0];
    let attrImg=result.images;
    let imgIndex=1;
    attrImg.forEach((imgsrc)=>{
        let img=document.createElement('img');
        img.src=imgsrc;
        let imgBox=document.createElement('div');
       
        imgBox.appendChild(img);
        rotator.appendChild(imgBox);
        imgBox.setAttribute('class', 'slides')
        imgBox.setAttribute('id', 'fade')
        img.setAttribute('class', 'spotImg');
        imgBox.style.display="none";
        
        let pointsGroup = document.querySelector('.pointsGroup');
        let Ball=document.createElement('span');
        Ball.classList.add('ball');
        Ball.setAttribute('onclick', `currentslide(${imgIndex})`)
        pointsGroup.appendChild(Ball);
        imgIndex++;

    });
}

function changeImg(n){
    showslides(slideIndex += n);
}

function currentslide(n) {
    showslides((slideIndex = n));
  }

function showslides(n){
    let i;
    let slides=document.getElementsByClassName('slides');
    let balls=document.getElementsByClassName('ball');
    for (i = 0; i < slides.length; i++) {
        slides[i].style.display = "none";
    };
    for (i = 0; i < balls.length; i++) {
        balls[i].id = balls[i].id.replace("active", "");
      };
    if (n > slides.length) { 
        slideIndex = 1 
    };
    if (n < 1) { 
        slideIndex = slides.length 
    };
    slides[slideIndex - 1].style.display = "block";
    balls[slideIndex - 1].id += "active";
}


radio1forenoon.addEventListener('click', ()=>{
    charge.textContent="新台幣 2000 元"
});

radio2afternoon.addEventListener('click', ()=>{
    charge.textContent="新台幣 2500 元"
});
