const form = document.querySelector('form')

form.addEventListener('submit', async e => {
    e.preventDefault()

    const name     = form.name.value
    const email    = form.email.value
    const password = form.password.value

    // Reset errors
    document.getElementById("name-error").textContent     = ''
    document.getElementById("email-error").textContent    = ''
    document.getElementById("password-error").textContent = ''

    try {
        const res = await fetch('/sign-up', {
            method: 'POST',
            body: JSON.stringify({ name, email, password}),
            headers: { 'Content-Type' : 'application/json' }
        })

        const data = await res.json()
        if(data.errors) {
            document.getElementById("name-error").textContent     = data.errors.name
            document.getElementById("email-error").textContent    = data.errors.email
            document.getElementById("password-error").textContent = data.errors.password
        }
        else if(data.user) {
            location.assign('/')
        }
        console.log(data)
    }
    catch(err){
        console.log(err)
    }
})