let suitcases = document.getElementById('suitcases')

async function getSuitcases() {
    try {
        const obj = await fetch('/get-suitcases')

        const data = await obj.json()
        console.log(data)
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
    h5.innerHTML = suitcase.name

    let qrImg = document.createElement('img')
    qrImg.src = suitcase.qr

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
    btn.value = suitcase._id
    btn.innerHTML = 'Remove'

    btn.addEventListener('click', function(){ removeSuitcase(this) })
    
    divBody.appendChild(h5)
    divBody.appendChild(qrImg)
    divBody.appendChild(ul)
    divBody.append(btn)
    div.appendChild(divBody)

    return div
}

let addBtn = document.getElementById('add-suitcase')
addBtn.addEventListener('click', addSuitcase)

async function addSuitcase() {
    let suitcaseName = document.getElementById("suitcase-name").value
    if(suitcaseName === "")
        return
    console.log(suitcaseName)

    try {
        const obj = await fetch('/add-suitcase', {
            method: 'POST',
            body: JSON.stringify({ suitcaseName }),
            headers: { 'Content-Type' : 'application/json' }
        })
        const suitcase = await obj.json()
        console.log("here" + suitcase._id)
        if(suitcase != null){
            container.appendChild(buildSuitcaseCard(suitcase))
        }
    }
    catch(err){
        console.log(err)
    }
}

async function removeSuitcase(btn) {
    btn.disabled = true;
    let suitcaseID = btn.value
    console.log(suitcaseID)
    try {
        const obj = await fetch('/remove-suitcase', {
            method: 'POST',
            body: JSON.stringify({ suitcaseID }),
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
    btn.disabled = false
}