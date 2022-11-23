Vue.use(VueRouter)


const Home = Vue.component('login-page',{ 
    template: `
                <div class="container-fluid" id="login-form">
                    <div class="row d-flex justify-content-center">
                        <div class="col-md-5 col-sm-6">
                            <div class="card px-5 py-5 shadow-lg">
                                <div class="display-1 text-center"><span style="color:blueviolet;">i</span>Kann</div>
                                <label for="inputId" class="form-label">Enter username</label>
                                <input type="text" class="form-control mb-3" id="inputId" v-model="username" placeholder="username">
                                <label for="inputPassword" class="form-label">Enter password</label>
                                <input type="password" class="form-control mb-3" id="inputPassword" v-model="password" placeholder="password">
                                <button class="btn-primary btn" @click="login">Submit</button>
                                <p class="pt-3">New to iKann?</p>
                                <p class="pt-0"><router-link to = "/signup">Signup</router-link></p>
                            </div>
                        </div>
                    </div>    
                </div>`,
    data:function(){
        return{
            username:"",
            password:""
        }
    },
    methods:{
        login:function(){
            this.$emit("login-submit",this.username,this.password)
        }
    }
})

const Signup= Vue.component('signup-page',{ 
    template: `
                <div class="container-fluid" id="signup-form">
                    <div class="row d-flex justify-content-center">
                        <div class="col-md-5 col-sm-6">
                            <div class="card px-5 py-5 shadow-lg">
                                <div class="display-1 text-center"><span style="color:blueviolet;">i</span>Kann</div>
                                <label for="signupId" class="form-label">Enter username</label>
                                <input type="text" class="form-control mb-3" id="signupId" v-model="username" placeholder="username">
                                <label for="signupPassword" class="form-label">Enter password</label>
                                <input type="password" class="form-control mb-3" id="signupPassword" v-model="password" placeholder="password">
                                <label for="signupconfirmPassword" class="form-label">Confirm password</label>
                                <input type="password" class="form-control mb-3" id="signupconfirmPassword" v-model="confirmpassword" placeholder="confirm password">
                                <label for="email" class="form-label">Enter email</label>
                                <input type="email" class="form-control mb-3" id="email" v-model="emailid" placeholder="someone@something.com">
                                <button class="btn-primary btn" @click="login">Submit</button>
                                <p class="pt-3">Already a user?</p>
                                <p class="pt-0"><router-link to = "/">Login</router-link></p>
                            </div>
                        </div>
                    </div>    
                </div>`,
    data:function(){
        return{
            username:"",
            password:"",
            confirmpassword:"",
            emailid:""

        }
    },
    methods:{
        login:function(){
            this.$emit("signup-submit",this.username,this.password,this.emailid)
        }
    }
})


const Card = Vue.component('card',{
    props:['cardobj'],
    template:
    `<div class="accordion">
        <div class="accordion-item mb-3" draggable="true" @dragstart="carddrag($event,cardobj)">
            <h2  v-if="titleediting" class="accordion-header" id="accordion" @dblclick="edititle" > 
                <button type="button" class="accordion-button collapsed" data-bs-toggle="collapse" v-bind:data-bs-target="cardidele" 
                :style="[checkbox ? {'background-color':'#3976D3'} : overdue ? {'background-color':'#800000'} : {'background-color':'green'}]" style=color:white>{{ newtitle }}</button>
            </h2>
            <input type="text" v-else class="form-control" v-model=newtitle @dblclick="edititle" @keyup.enter="edititle">
            <div class="accordion-collapse collapse" v-bind:id="cardselector">
                <div class="accordion-body">
                    <div class="card" @dblclick=editCard @keyup.enter=editCard>
                        <p class="card-text m-2" v-if="contentediting">{{ newcontent }}</p>
                        <textarea type=text class="form-control" v-else v-model="newcontent"></textarea>
                    </div>
                    <div class="row mt-3 text-center">
                        <div class="col-4" id="datetable">
                        <p>Created {{ cardobj.createdate }}</p>
                        </div>
                        <div class="col-4" id="datetable">
                        <p>Deadline {{ newdeadline }}</p>
                        </div>
                        <div class="col-4" id="datetable">
                        <p>Completed {{ cardobj.enddate }}</p>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-3">
                        <button class="btn" v-on:click="deleteCard" id="deletecard"><i class="bi bi-trash"></i></button> 
                        </div>
                        <div class="col-6">
                        <input type=date class="form-control mt-2" v-model=newdeadline> 
                        </div>
                        <div class="col-3">
                        <input class="form-check-input mt-3" data-toggle="tooltip" type="checkbox" id="completedbox" 
                            title="Mark Completed" v-model=checkbox :checked="checkbox"> 
                        </div>
                    </div>
                    
                </div>
            </div>

        </div>
    </div>`,

computed:{
    cardidele:function(){
        return "#" + this.cardselector
    },
    checkbox:{
        get(){return this.newenddate !== "-"},
        set(newval){
            this.cardobj.enddate = newval ? this.date : "-"
            this.updatecard(this.cardobj)
        }
    },
    overdue:function(){
        return this.newdeadline < this.date
    },
    date:function(){
        date = new Date().toLocaleDateString().split("/")
        return `${date[2]}-${date[0]}-${date[1]}`
    }
},

methods:{
    
    deleteCard: async function(){
        var cardid = this.cardobj.cardid
        const response = await fetch(`/card/${cardid}`,{
            method: 'DELETE',
            headers: {
            'Content-type': 'application/json'
            }            
        })
        
        populatecards(2)  
    },

    editCard:function(){
        this.contentediting = !this.contentediting
        if (this.contentediting){
            this.cardobj.cardcontent = this.newcontent
            this.updatecard(this.cardobj)
        }
    },

    edititle:function(){
        this.titleediting = !this.titleediting
        if (this.titleediting){
            this.cardobj.cardtitle = this.newtitle
            this.updatecard(this.cardobj)
        }
    },

    carddrag:function(event,card){
        event.dataTransfer.dropEffect = 'move'
        event.dataTransfer.effectAllowed = 'move'
        card = JSON.stringify(card)
        event.dataTransfer.setData('text/plain', card)
    },
    updatecard: async function(newvalue){
            await fetch(`/card/${this.cardobj.cardid}`,{
            method: 'PUT',
            headers: {
              'Content-type': 'application/json'
            },
            body: JSON.stringify(newvalue)
          })
          populatecards(2)
        }
},

data:function(){
    return {
        contentediting:true,
        titleediting:true,
        newcontent:this.cardobj.cardcontent,
        newtitle:this.cardobj.cardtitle,
        cardselector:"cardid" + this.cardobj.cardid,
        newdeadline:this.cardobj.deadline,
        newenddate:this.cardobj.enddate
        
    }
},
watch:{
    newdeadline:function(newvalue){
        this.cardobj.deadline = newvalue
        this.updatecard(this.cardobj)
    }
}
}
)

const List = Vue.component('list',{
    props:["list"],
    template:`
    <div  class="col-xl-2 col-lg-2 col-sm-12 col-md-2 col-xs-12 shadow-sm" 
            @drop.prevent="dropTarget($event)"  @dragenter.prevent @dragover.prevent :id="list.id">
        <ul class="nav nav-tabs">
            <li class="nav-item">
            <div class="display-6 mb-4" id="title">{{ list.name }}</div>
            </li>
        </ul>
        <card v-for="card in list.cards" :key=card.cardid :cardobj=card ref="card">
        </card>
        <div class="row">
        <button type=button class="btn" v-on:click="addCard(list.id)"><i class="bi bi-plus-square"></i></button>
        </div>
    </div>  `
,
methods:{
    dropTarget:function(event){
        var dropcard = event.dataTransfer.getData('text/plain')
        dropcard = JSON.parse(dropcard)
        const prevlistid = dropcard.listid
        const newlistid = this.list.id
        if (prevlistid != newlistid){

                dropcard.listid = newlistid
                console.log(prevlistid)
                console.log(newlistid)
                console.log(dropcard)
                this.updatecard(dropcard)
        }
    },

    addCard: async function(listid){

        const response = await fetch('/card', {
            method: 'POST',
            headers: {
              'Content-type': 'application/json'
            },
            body: JSON.stringify({listid:listid})
          })
          populatecards(2)
    },

    updatecard: async function(newvalue){
        await fetch(`/card/${newvalue.cardid}`,{
        method: 'PUT',
        headers: {
          'Content-type': 'application/json'
        },
        body: JSON.stringify(newvalue)
      })
      populatecards(2)
    }

}
})

const Kanban = Vue.component('kanban',{
    template:
    `
    <div class="container-fluid ml-5" id="kanban">
        <div class="row justify-content-center">
            <div id="dropzone" class="col-xl-1" @drop="deleteCard($event)"  @dragenter.prevent @dragover.prevent></div>
            <list v-for="list in lists" v-bind:list=list v-bind:key=list.id></list>
            <div id="dropzone" class="col-xl-1" @drop="deleteCard($event)"  @dragenter.prevent @dragover.prevent></div>
        </div>
        <div class="row" style="min-height:200px" @drop="deleteCard($event)"  @dragenter.prevent @dragover.prevent></div>           
    </div>`,
data:function(){
    return {
        lists:{}
    }
},
methods:{
    deleteCard:function(event){
        deletecard(event)}
},
async created(){
    populatecards(2)
}
})


const routes = [
    { path: '/', component: Home },
    { path: '/signup', component: Signup },
    { path: '/kanban', componend: Kanban}
  ]

const router = new VueRouter({routes,mode: 'history',})


var app = new Vue({
    el:"#vueapp",
    router,
    methods:{
        loginsubmit:function(username,password){
            console.log(username)
            console.log(password)
        },
        signupsubmit:function(username,password,emailid){
            console.log(username)
            console.log(password)
            console.log(emailid)
        },
        dropcard: async function(event,listid){
            var dropcard = event.dataTransfer.getData('text/plain')
            dropcard = JSON.parse(dropcard)
            var cardid = dropcard.cardid
            const response = await fetch(`/card/${cardid}`,{
                method: 'DELETE',
                headers: {
                'Content-type': 'application/json'
                }            
            })
            
            populatecards(2)
        }
    }
})


 async function populatecards(userid){
    try{
        var lists = await (await fetch(`/list/user/${userid}`)).json()
    }
    catch{}

    var allcards = {}
    for (let list of lists){
        var cards = await (await fetch(`/card/list/${list.listid}`)).json()
        cards.sort(function(card1,card2){
            if (card1.enddate < card2.enddate){return -1}
            else if(card1.endate > card2.endate){return 1}
            else return 0
        })    
        if (cards){
        stage = { id : list.listid, cards : cards, name : list.listname}
        allcards[list.listid] = stage}
        else{
            console.log(list)
             fetch(`/list/${list.listid}`,{
                method: 'DELETE',
                headers: {'Content-type': 'application/json'}         
            })
        }
    }
    app.$refs.kanban.lists = allcards
 }


 async function deletecard(event){
    var dropcard = event.dataTransfer.getData('text/plain')
        dropcard = JSON.parse(dropcard)
        var cardid = dropcard.cardid
        const response = await fetch(`/card/${cardid}`,{
            method: 'DELETE',
            headers: {
            'Content-type': 'application/json'
            }            
        })
        populatecards(2)

}