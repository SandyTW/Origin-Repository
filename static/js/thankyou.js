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
    document.getElementById('loginEmail').value = ''
    document.getElementById('loginPassword').value = '';
}

// 檢查會員登入狀態(if user doesn't login, redirect to home page)
document.querySelector('main').style.visibility = 'hidden'
function loginStatusCheck() {
    fetch('/api/user', { method: 'GET' }).then(function (response) {
        return response.json();
    }).then((result) => {
        console.log(result.data);
        if (result.data !== null) {
            getOrderdata()
            // document.getElementById('navLogin').style.display = 'none';
            document.querySelector('main').style.visibility = 'visible'

            document.getElementById('navLogout').style.display = 'inline-block';
            document.getElementById('navBooking').style.display = 'inline-block';
        } else {
            window.location.href = "/"
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
            window.location.href = "/"
        } else {
            alert(result['message']);
        }
    })
}


let Url = new URL(location.href);
    let orderNumber = Url.searchParams.get('number')
    console.log(orderNumber)
    apiUrl= `/api/order/${orderNumber}`;
    console.log(apiUrl)
function getOrderdata() {
    

    fetch( apiUrl, { method: 'GET' }).then(function (response) {
        return response.json();
    }).then((result) => {
        console.log(result)
        if (result.data !== null) {
            let orderNumber = document.getElementById('orderNumber')
            orderNumber.textContent = result.data["number"]

            let orderName = document.getElementById('orderName')
            orderName.textContent = '台北一日遊 - ' + result.data["trip"]["attraction"]["name"]

            let date = document.getElementById('date')
            let  orderdate = JSON.stringify(new Date(result.data["trip"]["date"]))
            console.log(orderdate)
            date.textContent = orderdate.slice(1,11)

            let time = document.getElementById('time')
            if (result.data["trip"]["time"]==="forenoon"){
                time.textContent = "早上 9 點到下午 4 點"
            }else{
                time.textContent = "下午 2 點到晚上 9 點"
            }
            
            let price =document.getElementById('orderAmount')
            price.textContent = 'NT$ ' + result.data["price"]


        }
    });
}
    