
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
        // console.log(result.data);
        if (result.data !== null) {
            getBookingdata()
            // document.getElementById('navLogin').style.display = 'none';
            document.querySelector('main').style.visibility = 'visible'
            let username = document.getElementById('username')
            username.textContent = result.data.name

            let useremail = document.getElementById('email')
            useremail.value = result.data.email

            let name = document.getElementById('name')
            name.value = result.data.name

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



// 取得尚未確認下單的預定行程
function getBookingdata() {
    fetch('api/booking', { method: 'GET' }).then(function (response) {
        return response.json();
    }).then((result) => {
        // console.log(result)
        if (result.data !== null) {
            let attrName = document.getElementById('attraction')
            attrName.textContent = result.data["attraction"]["name"]

            let attrAddress = document.getElementById('address')
            attrAddress.textContent = result.data["attraction"]["address"]

            let attrImg = document.querySelector('.image')
            attrImg.src = result.data["attraction"]["images"][0]

            let orderDate = document.getElementById('date')
            orderDate.textContent = result.data["date"]

            let orderTime = document.getElementById('time')
            if (result.data["time"]==="forenoon"){
                orderTime.textContent = "早上 9 點到下午 4 點"
            }else{
                orderTime.textContent = "下午 2 點到晚上 9 點"
            }

            let orderPrice = document.getElementById('price')
            orderPrice.textContent = result.data["price"]

            orderDetails(result.data)
        } else {
            document.querySelector('main section').style.display = 'none'
            document.querySelector('footer').style.height = '100vh'
            let msgContent = document.createElement('p')
            msgContent.setAttribute('class', 'msgContent')
            msgContent.appendChild(document.createTextNode('目前沒有任何待預訂的行程'));
            document.querySelector('.attrDisplay').appendChild(msgContent)
        }
    })
}

// 預定行程資料
function orderDetails(getBookingdata) {
    orderDetails = {
        "price": getBookingdata["price"],
        "trip": {
            "attraction": {
                "id": getBookingdata["attraction"]["id"],
                "name": getBookingdata["attraction"]["name"],
                "address": getBookingdata["attraction"]["address"],
                "image": getBookingdata["attraction"]["images"][0]
            },
            "date": getBookingdata["date"],
            "time": getBookingdata["time"]
        }
    }
    // console.log(orderDetails)
}

// 刪除目前的預定行程
function deleteBooking() {
    fetch('api/booking', { method: 'DELETE' }).then(function (response) {
        return response.json();
    }).then((result) => {
        console.log(result)
        let deleteDone = result['ok'];
        let deleteFailed = result['error'];
        if (deleteDone) {
            window.location.reload()
        } else {
            alert(result['message']);
        }
    })
}

// TapPay Fields 
// SetupSDK
TPDirect.setupSDK(20408, 'app_m0CR3vEC4ltucrCnFpP1IWm4jWBwe7rxqWMVZBWsObouyC1zbANIrlW6vNCm', 'sandbox');

// TPDirect.card.setup(config)
TPDirect.card.setup({
    fields: {
        number: {
            element: document.getElementById('card-number'),
            placeholder: '**** **** **** ****'
        },
        expirationDate: {
            element: '#card-expiration-date',
            placeholder: 'MM / YY'
        },
        ccv: {
            element: '#card-ccv',
            placeholder: 'CVV'
        }
    },
    styles: {
        'input': {
            'color': 'grey'
        },
        'input.ccv': {
            'font-size': '16px'
        },
        'input.expiration-date': {
            'font-size': '16px'
        },
        'input.card-number': {
            'font-size': '16px'
        },
        '.valid': {
            'color': 'green'
        },
        '.invalid': {
            'color': 'red'
        },
        '@media screen and (max-width: 400px)': {
            'input': {
                'color': 'orange'
            }
        }
    }
});

// TPDirect.card.onUpdate，得知目前卡片資訊的輸入狀態
TPDirect.card.onUpdate(update => {
    const orderButton = document.getElementById('orderBtn');
    if (update.canGetPrime) {
        // Enable submit Button to get prime.
        orderButton.removeAttribute('disabled');
        orderButton.style.cursor='pointer';
    } else {
        // Disable submit Button to get prime.
        orderButton.setAttribute('disabled', true);
    }
});

// call TPDirect.card.getPrime when user submit form to get tappay prime
document.getElementById("orderBtn").addEventListener('click', getPrime);
function getPrime(event) {
    event.preventDefault()
    // 取得 TapPay Fields 的 status
    const tappayStatus = TPDirect.card.getTappayFieldsStatus()
    console.log(tappayStatus)

    // 確認是否可以 getPrime (if canGetPrime (boolean) = true 全部欄位皆正確，可呼叫 getPrime)
    if (tappayStatus.canGetPrime === false) {
        console.log('can not get prime')
        return
    }
    // Get prime
    TPDirect.card.getPrime((result) => {
        if (result.status !== 0) {
            console.log('get prime error ' + result.msg)
        }
        console.log('get prime 成功，prime: ' + result.card.prime)
        let prime = result.card.prime;
         // send prime to server, to pay with Pay by Prime API.
         postOrder(prime);
    });

}

function postOrder(prime) {
    let name = document.getElementById('name').value
    let email = document.getElementById('email').value
    let phone = document.getElementById('phone').value

    fetch('/api/orders', {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            "prime": prime,
            "order": orderDetails,
            "contact": {
                "name": name,
                "email": email,
                "phone": phone,
            }
        })
    }).then(function (response) {
        return response.json()
    }).then((result) => {
        console.log(result)
        if (result['error']){
            alert(result['message']);
        }
      
        if (result["data"]["payment"]["status"] == 0){
            let orderNumber = result["data"]["number"];
            window.location.href = `/thankyou?number=${orderNumber}`
        }else{
            alert(result["data"]['payment']['message'] + "\r\n" + "\r\n" + result["data"]['number'])
        }
    }).catch(function(err){
        console.log(err)
    })
}
