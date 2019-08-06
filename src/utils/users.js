
const users = [] 

// assUser, removeUser , getUsersInRoom 

const addUser = ( {id , username , room  } ) => {
    //clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // validate the data
    if (!username || !room ){
        return {
            error: 'Username and room are required!'
        }

    }

    // check for existing user 
    const existingUser = users.find((user) => { 
        return user.room === room && user.username === username
    })

    // validate username 

    if(existingUser){
        return {
            error: 'Username is in use!'
        }
    }

    //Store user

    const user = { id , username , room}
    users.push(user)

    return { user }

}

const removeUser = (id) => {
    const index = users.findIndex( (user)  => {
        return user.id === id
    }) 

    if(index === -1){
        return {
            error:'No users found'
        }
    }
    return users.splice(index,1)[0] // it returns an object , it is bc there is [0] , is for access that, and it return the array whithout that user , 1 is for  deleting 1 element, it delete 1 user by index
}



const getUser = (id) => {
    return users.find( (user) => {
        return user.id === id
    })
}


const getUsersInRoom = (room_name) => {
    return users.filter ( ( user ) => {
        return user.room === room_name
    })
}

module.exports = {
    addUser ,
    removeUser ,
    getUser ,
    getUsersInRoom
}
