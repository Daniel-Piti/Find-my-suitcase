const form = document.querySelector('form')

form.addEventListener('submit', async e => {
    e.preventDefault()

    // Reset errors
    const email    = form.email.value
    const password = form.password.value
    console.log(email, password)
    document.getElementById("error-text").textContent = ''

    try {
        const res = await fetch('/sign-in', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type' : 'application/json' }
        })
        
        const data  = await res.json()
        if(data.error) {
            document.getElementById("error-text").textContent = data.error
        }
        else if(data.user) {
            location.assign('/')
        }
    }
    catch(err){
        console.log(err)
    }
})