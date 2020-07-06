const socket=io()


//elements
const $messageform=document.querySelector("#message-form")
const $messageformInput=$messageform.querySelector('input')
const $messageformButton=$messageform.querySelector('button')
const $locationButton=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

// templates
const messageTemplate=document.querySelector('#message-template').innerHTML
const locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector("#sidebar-template").innerHTML

//options
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})

const autoscroll=()=>{

    //New Message element
    const $newMessage=$messages.lastElementChild
    
    // Height of the New Message

    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    
    //Visible Height
    const visibleHeight=$messages.offsetHeight
    
    //Height of messages conatiner
    const conatinerHeight=$messages.scrollHeight

    //How far have I scrolled?
    const scrollOffset=$messages.scrollTop+visibleHeight

    if(conatinerHeight - newMessageHeight <= scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }

}

socket.on("message",(message)=>{
    
    const html=Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    
    autoscroll()
})

socket.on("locationMessage",(locationUrl)=>{
    
    const html=Mustache.render(locationTemplate,{
        username:locationUrl.username,
        url:locationUrl.url,
        createdAt:moment(locationUrl.createdAt).format('hh:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })

    document.querySelector('#sidebar').innerHTML=html
   
})

$messageform.addEventListener('submit',(e)=>{
    e.preventDefault()
    //disabled
    $messageformButton.setAttribute('disabled','disabled')


    const message=e.target.elements.message.value
    socket.emit('sendMessage',message,(error)=>{
        
        //enable
        $messageformButton.removeAttribute('disabled')
        //clear input
        $messageformInput.value=''
        $messageformInput.focus()

        if(error)
        {
            return console.log(error);
            
        }
        console.log("the message was delivered!");
        
    })



})
$locationButton.addEventListener('click',(e)=>{

    if(!navigator.geolocation){
        return alert('Geolocation in not supported by your browser')
    }
    //disabled
    $locationButton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>{
      
       
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            //enable
            $locationButton.removeAttribute('disabled')
            console.log("Location shared!")

        })

    })
})
socket.emit('join',{username,room},(error)=>{
    if(error)
    {
        alert(error)
        location.href='/'
    }

})
