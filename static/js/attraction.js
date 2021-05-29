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
        // console.log(rawData);
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
    charge.textContent=" 2000 "
});

radio2afternoon.addEventListener('click', ()=>{
    charge.textContent=" 2500 "
});

// 處理跳出視窗
function openPopupForm(form){
    console.log(form)
    document.getElementById('loginResult').textContent='';
    if(document.body.classList.contains('openpopups')){
        for (i=0; i<document.querySelectorAll('.popUp').length; i++ ){
            document.querySelectorAll('.popUp')[i].style.display='none';
        }
    }else{
        document.body.classList.add('openpopups');
    };
    document.getElementById(form).style.display='block';
    document.querySelector('.pageShadow').style.display='block';
}

function closePopup(e) {
    if(e.classList.contains("pageShadow")){
        for (i = 0; i<document.querySelectorAll('.popUp').length; i++) {
            document.querySelectorAll('.popUp')[i].style.display='none';
        }
    }else{
        e.parentElement.style.display='none';
    };
    document.body.classList.remove("openpopups");
    document.querySelector('.pageShadow').style.display='none';
    document.getElementById('loginEmail').value=''
    document.getElementById('loginPassword').value='';
}

// 註冊function
function openRegister(){
    document.getElementById('registerResult').textContent='';
    let popUplogin=document.getElementById('popUplogin');
    let popUpRegister=document.getElementById('popUpRegister');
    popUplogin.style.display='none';
    popUpRegister.style.display='block';
}

// 檢查會員登入狀態
function loginStatusCheck(){
    fetch('/api/user', {method:'GET'}).then(function (response){
        return response.json();
    }).then((result) => {
        console.log(result.data);
        if (result.data!==null){
            document.getElementById('navLogin').style.display='none';
            document.getElementById('navLogout').style.display='inline-block';
            document.getElementById('navBooking').style.display='inline-block';
            
        }else{
            document.getElementById('navLogin').style.display='inline-block';
            document.getElementById('navLogout').style.display='none';
            document.getElementById('navBooking').style.display='inline-block';
        }
    })
};
loginStatusCheck()

// 註冊流程
function newRegister(){
    let registerName=document.getElementById('registerName').value;
    let registerEmail=document.getElementById('registerEmail').value;
    let registerPassword=document.getElementById('registerPassword').value

    fetch('/api/user', {
        method:'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "name": registerName,
            "email": registerEmail,
            "password": registerPassword
        })
    }).then(function (response){
        return response.json()
    }).then((result) => {
        console.log(result)
        let registerDone=result['ok'];
        let registerFailed=result['error'];
        let msgBox=document.getElementById('registerResult');
        msgBox.textContent='';

        if (registerDone){ 
            msgBox.textContent='註冊成功';    
            document.getElementById('registerName').value='';
            document.getElementById('registerEmail').value='';
            document.getElementById('registerPassword').value='';
        }else{
            let msgBox=document.getElementById('registerResult');
            msgBox.textContent=result['message']
            msgBox.style.display='block';
            document.getElementById('registerName').value='';
            document.getElementById('registerEmail').value='';
            document.getElementById('registerPassword').value='';
        }
    });   
}

// 登入流程
function userLogin(){
    let loginEmail=document.getElementById('loginEmail').value;
    let loginPassword=document.getElementById('loginPassword').value;

    fetch('/api/user', {
        method:'PATCH',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "email": loginEmail,
            "password": loginPassword
        })
    }).then(function (response){
        return response.json()
    }).then((result) => {
        console.log(result)
        let loginDone=result['ok'];
        let loginFailed=result['error'];
        let msgBox=document.getElementById('loginResult');
        msgBox.textContent='';
    
        if (loginDone){
            msgBox.textContent='登入成功';
            window.location.reload()
        }else{
            let msgBox=document.getElementById('loginResult');
            msgBox.textContent=result['message']
            msgBox.style.display='block';
            document.getElementById('loginPassword').value='';  
        }
    })
}

// 登出流程
function userLogout(){
    fetch('/api/user', {method:'DELETE'}).then(function (response){
        return response.json();
        console.log(response)
    }).then((result) => {
        console.log(result);
        let logoutDone=result['ok'];
        let logoutFailed=result['error'];
        
        if (logoutDone){
            window.location.reload();
        }else{
            alert(result['message']);
        }
    })
}

// 開始預訂行程
function submitOrder(){
    let attractionId=parseInt(pathname.split('attraction/')[1])
    let date=document.getElementById('date').value
    let time=document.querySelector('input[name="time"]:checked').value
    let price=document.getElementById('charge').textContent
    // console.log(attractionId, date, time, price)
   
    fetch('/api/booking', {
        method:'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "attractionId": attractionId,
            "date": date,
            "time": time,
            "price": price,
        })
    }).then(function (response){
        if(response.status!==500){
            return response.json()}
    }).then((result) => {
        // console.log(result)
        let submitDone=result['ok']
        let submitFailed=result['error']
        if (submitDone){
            window.location.href = '/booking'
        }else if (result['message']=="未登入系統，拒絕存取"){
            openPopupForm('popUplogin')
        }else{
            alert(result['message']);
        }
    })
}

// 預定行程
function openBooking(){
    fetch('/api/user', {method:'GET'}).then(function (response){
        return response.json();
    }).then((result) => {
        if (result.data!==null){
            window.location.href="/booking"
        }else{
            openPopupForm('popUplogin')
        }
    })
}


let today = new Date().toISOString().split('T')[0]; 
document.getElementById("date").setAttribute('min', today); 