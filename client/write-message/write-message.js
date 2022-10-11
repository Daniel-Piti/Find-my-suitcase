const form = document.querySelector('form')

submitBtn = document.getElementById('submit-btn')

form.addEventListener('submit', async e => {
    e.preventDefault()

    submitBtn.disabled = true

    const QR       = form.QR.value
    const location = form.location.value
    const message  = form.message.value
    
    try {
        const res = await fetch('/add-message', {
            method: 'POST',
            body: JSON.stringify({ QR, location, message}),
            headers: { 'Content-Type' : 'application/json' }
        })

        const data = await res.json()
        console.log(data.status)
        if(data.status === "OK"){
            submitBtn.disabled = false
        }

    }
    catch(err){
        console.log(err)
    }
})