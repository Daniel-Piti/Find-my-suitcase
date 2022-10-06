let helloText = document.getElementById('hello')

async function getName() {
    try {
        const obj = await fetch('/get-name')

        const data = await obj.json()

        return data.name
    }
    catch(err){
        return ""
    }
}

const setName = async function() {
    helloText.innerHTML = 'Hello ' + await getName()
}

setName()