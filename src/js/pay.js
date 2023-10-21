const jsConfetti = new JSConfetti();

let paymentActive = false;
let paymentRequest;

// Fungsi requestPayment
async function requestPayment(amount, comment, callback) {
    try {
        const phoneNumber = document.getElementById('noPonsel').value;
        if (!phoneNumber) {
            alert("Please enter a phone number.");
            return;
        }

        const response = await fetch('/invoice', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: amount,
                comment: comment,
                phoneNumber: phoneNumber
            })
        });

        const data = await response.json();

        if (data.payment_request) {
            paymentRequest = data.payment_request;
            // Anda bisa menampilkan QR code atau informasi pembayaran lainnya di sini
            // ...

            // Jika Anda memiliki fungsi polling untuk memeriksa pembayaran, Anda bisa memulainya di sini
            startPollingPayment(data.payment_hash, 1000, callback);
        } else {
            console.error("Pembayaran gagal:", data.message);
        }
    } catch (error) {
        console.error("Terjadi kesalahan saat meminta pembayaran:", error);
    }
}

document.getElementById('startPaymentBtn').addEventListener('click', function() {
    const amount = document.getElementById('amount').value;
    const comment = document.getElementById('comment').value;
    requestPayment(amount, comment, success);
});

// ... (kode Anda yang lain, seperti fungsi startPollingPayment, success, dll.)

// ... (kode Anda yang lain)


    if(paymentActive) return;

    paymentActive = true;

    const result = await fetchInvoice(amount, comment, phoneNumber);

    paymentRequest = result.payment_request;

    document.querySelector('#pay .loading-text').textContent = "Waiting for your payment...";
    document.querySelector('#pay .qr-container').classList.remove('d-none');
    document.querySelector('#pay .qr-link').href = "lightning:" + result.payment_request;
    document.querySelector('#pay .qr').src = result.qrCode;

    if (window.webln) {
        document.querySelector('#pay .webln-button').classList.remove('d-none');
    } 

    startPollingPayment(result.payment_hash, 1000, function () {
        payModal.hide();
        paymentActive = false;

        onSuccess();
    });


async function startWebLNPayment() {
    try {
        await window.webln.enable();
        await window.webln.sendPayment(paymentRequest);
    }
    catch(e) {
        alert("An error happened during the payment.");
    }    
}

async function isPaid(payment_hash) {
    const response = await fetch('/invoice/' + payment_hash);
    const result = await response.json();
    return result.paid;
}

function startPollingPayment(payment_hash, timeout, onSuccess) {
    if(!paymentActive) return;

    setTimeout(async function () {
        const result = await isPaid(payment_hash);

        if (!result) {
            startPollingPayment(payment_hash, timeout, onSuccess);
        } else {
            onSuccess();
        }
    }, timeout);
}

function success() {
    jsConfetti.addConfetti({
        emojis: ['🌈', '⚡️', '💥', '✨', '💫', '🌸'],
    });
}
