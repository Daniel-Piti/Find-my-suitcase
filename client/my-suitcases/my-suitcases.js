let suitcases = document.getElementById('suitcases')

async function getSuitcases() {
    try {
        const obj = await fetch('/get-suitcases')

        const data = await obj.json()

        addSuitcasesCards(data)
    }
    catch(err){
        console.log(err)
    }
}

getSuitcases()

const container = document.getElementById('container');

function addSuitcasesCards(suitcases){
    suitcases.forEach(suitcase => {
        container.appendChild(buildSuitcaseCard(suitcase))
    });
}

function buildSuitcaseCard(suitcase){
    let div = document.createElement('div')
    div.classList.add('card')
    let divBody = document.createElement('div')
    divBody.classList.add('card-body')

    let h5  = document.createElement('h5')
    h5.classList.add('card-title')
    h5.innerHTML = suitcase.qr
    let ul = document.createElement('ul')

    if(suitcase.massages.length > 0) {
        suitcase.massages.forEach(message => {
            let li = document.createElement('li')
            li.classList.add('card-text')
            li.style.color = 'green'
            li.style.fontWeight = 'bold';
            li.innerHTML = message.location + ' - ' + message.message
            ul.appendChild(li)
        })
    }
    else {
        let li = document.createElement('li')
        li.classList.add('card-text')
        li.innerHTML = 'There is no any data yet'
        ul.appendChild(li)
    }

    let btn  = document.createElement('button')
    btn.classList.add('btn')
    btn.classList.add('btn-danger')
    btn.value = suitcase.qr
    btn.innerHTML = 'Remove'

    btn.addEventListener('click', function(){ removeSuitcase(this) })
    
    divBody.appendChild(h5)
    divBody.appendChild(ul)
    divBody.append(btn)
    div.appendChild(divBody)

    return div
}

let addBtn = document.getElementById('add-suitcase')
addBtn.addEventListener('click', addSuitcase)

async function addSuitcase() {
    try {
        const obj = await fetch('/add-suitcase')
        const suitcase = await obj.json()
        console.log(suitcase)
        container.appendChild(buildSuitcaseCard(suitcase))
    }
    catch(err){
        console.log(err)
    }
}

async function removeSuitcase(btn) {
    let QR = btn.value
    console.log(QR)
    try {
        const obj = await fetch('/remove-suitcase', {
            method: 'POST',
            body: JSON.stringify({ QR }),
            headers: { 'Content-Type' : 'application/json' }
        })
        const res = await obj.json()
        if(res.status === "OK"){
            container.removeChild(btn.parentNode.parentNode)
        }
    }
    catch(err){
        console.log(err)
    }
}