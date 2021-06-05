let page = 0;
let nextPage = 0;
let keyword;
let apiUrl;

getAttractions(page, keyword);

// window.addEventListener('scroll', scrolling);
window.addEventListener('scroll', debounce(scrolling, 200));

// function hideloading(){
//     document.querySelector('.loader').style.display='none'

// }

function getAttractions(page, keyword) {
    if (keyword) {
        apiUrl = `/api/attractions?page=${page}&keyword=${keyword}`;
    }else {
        apiUrl = `/api/attractions?page=${page}`;
    }
    console.log(apiUrl);
    fetch(apiUrl).then(function (response) {
        return response.json();
    }).then((rawData) => {
        console.log(rawData);
        nextPage = rawData['nextPage'];
        dataProcessing(rawData);
    });
};

// 處理 Attraction Display
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
            title.textContent = attractions[i]['name'];

            let info = document.createElement('div');
            info.classList.add('imgInfo');

            let category = document.createElement('div');
            category.classList.add('imgCategory');
            category.textContent = attractions[i]['category'];

            let mrt = document.createElement('div');
            mrt.classList.add('imgMrt');
            mrt.textContent = attractions[i]['mrt'];

            let id=document.createElement('a');
            attrID=attractions[i]['id']
            id.href='/attraction/' + attrID

            id.appendChild(img);
            info.append(mrt, category);
            textBox.append(title, info);
            attractionContainer.appendChild(id);
            attractionContainer.appendChild(textBox);
            document.getElementById('picSection').appendChild(attractionContainer);
        }
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

// 處理 infinite scroll
function scrolling() {
    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    // console.log({ scrollTop, scrollHeight, clientHeight});
    if (clientHeight + scrollTop >= scrollHeight - 5) {
        console.log('to the bottom');
        //show the loading data
        loading();
    }
};


function loading() {
    if (nextPage !== null) {
        page = nextPage;
        keyword=document.getElementById('wordforsearch').value;
        console.log(page, keyword);
        getAttractions(page, keyword);   
    }
};

function debounce(func, delay) {
	let timeout=null;
	return function() {
		let context = this;
        let args = arguments;

		clearTimeout(timeout);
		timeout = setTimeout(function(){
            timeout=null;
            func.apply(context, args);
        }, delay);
	};
};

// 處理 search attractions by keyword
function searchAttraction(event) {
    event.preventDefault();
    while (document.getElementById('attractionContent')) {
        document.getElementById('attractionContent').remove();
    };
    let keyword = document.getElementById('wordforsearch').value;
    page = 0;
    if (keyword==''){
        return false;
    }else{
        console.log(keyword);
        getAttractions(page, keyword);
    }
};

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
