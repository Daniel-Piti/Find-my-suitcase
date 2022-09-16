const form = document.querySelector('form')

form.addEventListener('submit', async e => {
    e.preventDefault()

    // Reset errors
    const email    = form.email.value
    const password = form.password.value

    document.getElementById("email-error").textContent    = ''
    document.getElementById("password-error").textContent = ''

    try {
        const res = await fetch('/sign-in', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
            headers: { 'Content-Type' : 'application/json' }
        })

        const data = await res.json()
        if(data.errors) {
            document.getElementById("email-error").textContent    = data.errors.email
            document.getElementById("password-error").textContent = data.errors.password
        }
        else if(data.user) {
            location.assign('/')
        }
    }
    catch(err){
        console.log(err)
    }
})