
const socket = io()

//elements 

const $messageForm = document.querySelector('#message-form') // the $ is a convenction, to understand that variable is connected to a dom element of the html file
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

//templates

const messageTemplate = document.querySelector('#message-template').innerHTML
const messageTemplate2 = document.querySelector('#message-template2').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

socket.on('countUpdated' , (contatore) => { // this event name ofocurse has to exact match with the name of the event in index.js ( server side )
   // console.log('The count has been updated!' , contatore)

})

//options

const { username , room} = Qs.parse(location.search, { ignoreQueryPrefix : true })

const autoscroll = () => {
    //New message element
    const $newMessage = $messages.lastElementChild

    //Height of the last message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //console.log(newMessageMargin)

    //Visible height
    const visibleHeight = $messages.offsetHeight

    //Height of messages container

    const containerHeight = $messages.scrollHeight

    //How far have i scrolled?

    const scrollOffset = $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop = $messages.scrollHeight

    }
}

socket.on('message' , (message) => { // here the client listen for that event

    const html = Mustache.render(messageTemplate , {
        username : message.username, 
        message : message.text,
        createdAt : moment(message.createdAt).format('h:mm:A ')
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
    
})



socket.on('roomData' , ({room , users}) => { 
   const html = Mustache.render(sidebarTemplate , {
       room , 
       users
   })
   document.querySelector('#sidebar').innerHTML = html

})


$messageForm.addEventListener('submit' , (e) => {
    e.preventDefault() // prevent full page refresh each time

    $messageFormButton.setAttribute('disabled' , 'disabled')

    const message = e.target.elements.message.value // message bc the name of the item is 'message' in the index.html file
    socket.emit('sendMessage' , message , (error) => {
        //console.log('The message was delivered' , mex)
        if(error)
            return console.log(error)
        console.log('Message delivered')

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value=''
        $messageFormInput.focus()
        
    })

})

socket.on('messageAll' , (mex) => {
    console.log(mex)

})


$sendLocationButton.addEventListener('click' , () =>{
    if(!navigator.geolocation)
        return alert('Geolocation is not supported by ur browser. ')

    $sendLocationButton.setAttribute('disabled' , 'disabled')

    navigator.geolocation.getCurrentPosition( (position) => {
        console.log(position)
        socket.emit('sendLocation', position.coords.latitude , position.coords.longitude , () => {
            console.log('Location shared')
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.on('locationMessage' , (url) => {
    const html = Mustache.render(messageTemplate2 , {
        username : url.username,
        createdAt : moment(url.createdAt).format('h:mm:a'),
        mex : url.url
    })
    $messages.insertAdjacentHTML('beforeend' , html)
    autoscroll()
})

socket.emit('join' , {username , room } , (error) => {
   if(error) {
       alert(error)
       location.href = '/'
   }

})







