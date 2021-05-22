
// 處理跳出視窗
function openPopupForm(form) {
    console.log(form)
    document.getElementById('loginResult').textContent = '';
    if (document.body.classList.contains('openpopups')) {
        for (i = 0; i < document.querySelectorAll('.popUp').length; i++) {
            document.querySelectorAll('.popUp')[i].style.display = 'none';
        }
    } else {
        document.body.classList.add('openpopups');
    };
    document.getElementById(form).style.display = 'block';
    document.querySelector('.pageShadow').style.display = 'block';
}

function closePopup(e) {
    if (e.classList.contains("pageShadow")) {
        for (i = 0; i < document.querySelectorAll('.popUp').length; i++) {
            document.querySelectorAll('.popUp')[i].style.display = 'none';
        }
    } else {
        e.parentElement.style.display = 'none';
    };
    document.body.classList.remove("openpopups");
    document.querySelector('.pageShadow').style.display = 'none';
    document.getElementById('loginEmail').value=''
    document.getElementById('loginPassword').value='';
}

// 檢查會員登入狀態(if user doesn't login, redirect to home page)
document.querySelector('main').style.visibility='hidden'
function loginStatusCheck() {
    fetch('/api/user', { method: 'GET' }).then(function (response) {
        return response.json();
    }).then((result) => {
        console.log(result.data);
        if (result.data !== null) {
            getBookingdata()
            // document.getElementById('navLogin').style.display = 'none';
            document.querySelector('main').style.visibility='visible'
            let username=document.getElementById('username')
            username.textContent=result.data.name
            document.getElementById('navLogout').style.display = 'inline-block';
            document.getElementById('navBooking').style.display = 'inline-block';
        } else {
            window.location.href="/"
        }
    })
};
loginStatusCheck();


// 登出流程 (if user logout, redirect to home page)
function userLogout() {
    fetch('/api/user', { method: 'DELETE' }).then(function (response) {
        return response.json();
        console.log(response)
    }).then((result) => {
        console.log(result);
        let logoutDone = result['ok'];
        let logoutFailed = result['error'];

        if (logoutDone) {
            window.location.href="/"
        } else {
            alert(result['message']);
        }
    })
}



// 取得尚未確認下單的預定行程
function getBookingdata() {
    fetch('api/booking', { method: 'GET' }).then(function (response) {
        return response.json();
    }).then((result) => {
        console.log(result)
        if (result.data!==null){
            let attrName=document.getElementById('attraction')
            attrName.textContent=result.data["attraction"]["name"]

            let attrAddress=document.getElementById('address')
            attrAddress.textContent=result.data["attraction"]["address"]

            let attrImg=document.querySelector('.image')
            attrImg.src=result.data["attraction"]["images"][0]

            let orderDate=document.getElementById('date')
            orderDate.textContent=result.data["date"]

            let orderTime=document.getElementById('time')
            if (result.data["time"]='forenoon'){
                orderTime.textContent="早上 9 點到下午 4 點"
            }else{
                orderTime.textContent="下午 2 點到晚上 9 點"
            }

            let orderPrice=document.getElementById('price')
            orderPrice.textContent=result.data["price"]
        }else{
            document.querySelector('main section').style.display='none'
            let msgContent = document.createElement('p')
            msgContent.setAttribute('class', 'msgContent')
            msgContent.appendChild(document.createTextNode('目前沒有任何待預訂的行程'));
            document.querySelector('.attrDisplay').appendChild(msgContent)
        }
    })
}

// 刪除目前的預定行程
function deleteBooking(){
    fetch('api/booking', { method: 'DELETE' }).then(function (response) {
        return response.json();
    }).then((result) => {
        console.log(result)
        let deleteDone = result['ok'];
        let deleteFailed = result['error'];
        if (deleteDone){
            window.location.reload()
        }else {
            alert(result['message']);
        }
    })
}