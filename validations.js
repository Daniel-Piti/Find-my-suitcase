function validString(str) {
    if(str === undefined || str.length === 0)
        return false
    return true
}

exports.buildUser = user => {
    var REQUIRED_FIELDS = ["name", "email"]

    let newUser = {}

    REQUIRED_FIELDS.forEach((field, index)=> {
        if(field in user == false){
            if(validString(user.field) == false){
                return false
            }
        }
        newUser[field] = user[field]
    })

    newUser.suitCases = []

    return newUser
}