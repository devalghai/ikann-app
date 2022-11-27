Vue.use(VueRouter)



var store={
    token:null
}


const Home = Vue.component('login-page',{ 
    template: `
                <div class="container-fluid" id="login-form">
                    <div class="row d-flex justify-content-center">
                        <div class="col-md-5 col-sm-6">
                            <div class="card px-5 py-5 shadow-lg">
                                <div class="display-1 text-center"><span style="color:blueviolet;">i</span>Kann</div>
                                <label for="inputId" class="form-label">Enter username</label>
                                <input type="text" class="form-control mb-3" id="inputId" v-model="username" placeholder="username" @keyup.enter="login">
                                <label for="inputPassword" class="form-label">Enter password</label>
                                <input type="password" class="form-control mb-3" id="inputPassword" v-model="password" placeholder="password" @keyup.enter="login">
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
        login: async function(){
            var response = await fetch('/authenticate',{
                method:'POST',
                headers:{
                    'Content-type':'application/json'
                },
                body:JSON.stringify({username:this.username,
                                    password:this.password})})
                                    

            if(response.status === 200){
                const data = await response.json()
                if(data.token){
                    store.token = data.token
                    this.$router.push(`/kanban`)
                }
            }
            else{
                const data = await response.json()
                alert(data.message)
            }
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
                                <input type="text" class="form-control mb-3" id="signupId" v-model="username" placeholder="username" @keyup.enter="signup">
                                <label for="signupPassword" class="form-label">Enter password</label>
                                <input type="password" class="form-control mb-3" id="signupPassword" v-model="password" placeholder="password" @keyup.enter="signup">
                                <label for="signupconfirmPassword" class="form-label">Confirm password</label>
                                <input type="password" class="form-control mb-3" id="signupconfirmPassword" v-model="confirmpassword" placeholder="confirm password" @keyup.enter="signup">  
                                <label for="email" class="form-label">Enter email</label>
                                <input type="email" class="form-control mb-3" id="email" v-model="email" placeholder="someone@something.com" @keyup.enter="signup">
                                <button class="btn-primary btn" @click="signup">Submit</button>
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
            email:""

        }
    },
    methods:{
        signup: async function(){
            if (this.password != this.confirmpassword){alert("Passwords do not match.")}
            else{
                var created = await fetch(`/user`,{
                    method: 'POST',
                    headers:{
                    'Content-type': 'application/json'
                    },
                    body:JSON.stringify({username:this.username,
                                        password:this.password,
                                        email:this.email})               
                }).then(response => response.json())
                .then(data => data);
        
        if(created){
            alert(created["message"])
        }
        
        else{
            this.$router.push("/")
        }        
    }
            

        }
    }
})



const Card = Vue.component('card',{
    props:['cardobj'],
    template:
    `<div class="accordion">
        <div class="accordion-item mb-3" draggable="true" @dragstart="carddrag($event,cardobj)">
            <h2  v-show="titleediting" class="accordion-header" id="accordion" @dblclick="edititle" > 
                <button type="button" class="accordion-button collapsed" data-bs-toggle="collapse" v-bind:data-bs-target="cardidele"
                :style="[checkbox ? {'background-color':'#3976D3'} : overdue ? {'background-color':'#800000'} : {'background-color':'green'}]" style="color:white">{{ newtitle }}</button>
            </h2>
            <input type="text" v-show="!titleediting" class="form-control" v-model=newtitle @dblclick="edititle" @keyup.enter="edititle">
            <div class="accordion-collapse collapse" v-bind:id="cardselector">
                <div class="accordion-body">
                    <div class="card" @dblclick=editCard @keyup.enter=editCard>
                        <p class="card-text m-2 h-6" v-if="contentediting">{{ newcontent }}</p>
                        <textarea type=text class="form-control" v-else v-model="newcontent"></textarea>
                    </div>
                    <div class="row mt-3 text-center">
                        <div class="col-4" id="datetable">
                        <h6>Created</h6>
                        <p>{{ cardobj.createdate }}</p>
                        </div>
                        <div class="col-4" id="datetable">
                        <h6>Deadline</h6>
                        <p>{{ newdeadline }}</p>
                        </div>
                        <div class="col-4" id="datetable">
                        <h6>Completed</h6>
                        <p>{{ newenddate }}</p>
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
            this.newenddate = newval ? this.date : "-"
        }
    },
    overdue:function(){
        return this.newdeadline < this.date
    },
    date:function(){
        let date = new Date().toLocaleDateString().split("/")
        return `${date[2]}-${date[0]}-${date[1]}`
    }
},

methods:{
    
    deleteCard: async function(){
        var cardid = this.cardobj.cardid
        const response = await fetch(`/card/${cardid}`,{
            method: 'DELETE',
            headers: {
            'Content-type': 'application/json',
            'Authorization' : `Bearer ${store.token}`
            }            
        })
        
        populatecards()  
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
              'Content-type': 'application/json',
              'Authorization' : `Bearer ${store.token}`
            },
            body: JSON.stringify(newvalue)
          })
          populatecards()
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
    },
    newenddate:function(newvalue){
        this.cardobj.enddate = this.newenddate
        this.updatecard(this.cardobj)
    }
}
}
)

const List = Vue.component('list',{
    props:["list"],
    template:`
    <div  class="col-xl-2 col-lg-6 col-sm-12 col-md-12 col-xs-12 shadow-sm"  
            @drop.prevent="dropTarget($event)"  @dragenter.prevent @dragover.prevent :id="list.id">
        <ul class="nav nav-tabs">
            <li class="nav-item">
            <div class="display-6 mb-1" id="title" v-if="listediting" @dblclick=editlist>{{ newlistname }}</div>
            <input class='form-control' type=text v-else 
            v-model=newlistname v-bind:placeholder="newlistname" @dblclick=editlist @keyup.enter=editlist maxlength="15">
            <div class="h6 mb-4" @dblclick=editlist v-if="listediting">{{ newlistcontent }}</div>
            <input class='form-control  mb-4' type=text v-else 
            v-model=newlistcontent v-bind:placeholder="newlistcontent" @dblclick=editlist @keyup.enter=editlist maxlength="25">
            </li>
        </ul>
        <div class="row">
        <button type=button class="btn" v-on:click="addCard(list.id)"><i class="bi bi-plus-square"></i></button>
        <button type=button class="btn" v-if=isempty style="color:red" title="Delete list" @click="deletelist"><i class="bi bi-folder-minus"></i></button>
        </div>
        <card v-for="card in list.cards" :key=card.cardid :cardobj=card ref="card">
        </card>
    </div>  `
,
methods:{
    editlist:function(){
        this.listediting = !this.listediting
        if (this.listediting){
            this.list.name = this.newlistname
            this.list.content = this.newlistcontent
            this.updatelist(this.list)
        }
    },
    dropTarget:function(event){
        var dropcard = event.dataTransfer.getData('text/plain')
        dropcard = JSON.parse(dropcard)
        const prevlistid = dropcard.listid
        const newlistid = this.list.id
        if (prevlistid != newlistid){
                dropcard.listid = newlistid
                this.updatecard(dropcard)
        }
    },

    addCard: async function(listid){

        const response = await fetch('/card', {
            method: 'POST',
            headers: {
              'Content-type': 'application/json',
              'Authorization' : `Bearer ${store.token}`
            },
            body: JSON.stringify({listid:listid})
          })
          populatecards()
    },

    updatecard: async function(newvalue){
        const response = await fetch(`/card/${newvalue.cardid}`,{
        method: 'PUT',
        headers: {
          'Content-type': 'application/json',
          'Authorization' : `Bearer ${store.token}`
        },
        body: JSON.stringify(newvalue)
      })
      populatecards()
    },

    updatelist: async function(newvalue){
        const response = await fetch(`/list/${newvalue.id}`,{
            method: 'PUT',
            headers:{
                'Content-type': 'application/json',
                'Authorization' : `Bearer ${store.token}`
            },
            body: JSON.stringify(newvalue)
        })
        populatecards()
    },
    deletelist:async function(){
        const response = await fetch(`/list/${this.list.id}`,{
            method: 'DELETE',
            headers: {'Content-type': 'application/json',
            'Authorization' : `Bearer ${store.token}`}         
        })
        populatecards()
    }

},
    data:function(){
        return {
            listediting:true,
            newlistname:this.list.name,
            newlistcontent:this.list.content
        }
    },
    computed:{
        isempty:function(){
            return !this.list.cards
            
        }
    }
})


const Activity = Vue.component('activity',{
    template:`
    <div>
        
        <div class="container-fluid" id="activity">
        <!--// WELCOME SECTION STARTS-->
            <div class="row justify-content-center" id="welcome">
                <div class="col-12  text-center">
                    <div class="display-2 mb-2">Welcome <span style="color:blueviolet;">{{username }}</span></div>
                </div>
            </div>
            <div class="row justify-content-center mb-3">
                <div class="col-2 text-center">
                <button type="button" class="btn" style='font-size:35px;' @click="kanban"><i class="bi bi-card-checklist"></i></button>
                </div>
                <div class="col-2 text-center">
                <button type="button" class="btn" style='font-size:35px;' @click="logout"><i class="bi bi-box-arrow-right "></i></button><br>
                </div>
            </div>
        <!--// CHART SECTION STARTS--> 
            <div class="row chart-container justify-content-center " style="position: relative; height:10vh; width:20vw;margin: 0 auto;">
                <canvas id="myChart"></canvas>
            </div>
            <div class="row" style="min-height:200px"></div>           
        </div>
    </div>`,

    data:function(){
        return {
            listdata:[]
        }
    },

    computed:{
        date:function(){
            let date = new Date().toLocaleDateString().split("/")
            return `${date[2]}-${date[0]}-${date[1]}`
        },
    },

    methods:{
        logout:function(){
            this.$router.push("/")
        },
        kanban:function(){
            this.$router.push("/kanban")
        }
    },
    async beforeCreate(){
        var lists = await fetch(`/list/user`,{
            method : 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization' : `Bearer ${store.token}`
            }
        }
    ).then(data => data.json()).then(data => data)
    
    let completed = 0
    let overdue = 0
    let todo = 0

    if(lists){
        for (let list of lists){
            var cards = await fetch(`/card/list/${list.listid}`,{
                                                    method : 'GET',
                                                    headers: {
                                                        'Content-Type': 'application/json',
                                                        'Authorization' : `Bearer ${store.token}`
                                                    }
                                                }
                                            ).then(data => data.json()).then(data => data)

                    if (cards){
                            for (let card of cards){
                                if (card.enddate != "-"){ completed+=1}
                                else if(card.deadline >= this.date){todo+=1}
                                else {overdue+= 1}
                            }
                        }
                    }
                }

        const ctx = document.getElementById('myChart');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
            labels: ['Completed','Overdue','To-Do'],
            datasets: [{
                label: 'Tasks left',
                data: [completed,overdue,todo],
                backgroundColor: [
                    '#3976D3',
                    '#800000',
                    'green'
                  ],
                borderWidth: 1,
                hoverOffset: 4
            }]
            }
        })
        
            },
    data:function(){
        return {
            username:this.$root.username
        }
    }
})



const Kanban = Vue.component('kanban',{
    template:
    `
    <div>
        
        <div class="container-fluid" id="kanban" @drop="deleteCard($event)"  @dragenter.prevent @dragover.prevent>
        <!--// WELCOME SECTION STARTS-->
            <div class="row justify-content-center" id="welcome">
                <div class="col-12  text-center">
                    <div class="display-2  mb-2">Welcome <span style="color:blueviolet;">{{username }}</span></div>
                </div>
            </div>
            <div class="row justify-content-center">
                <div class="col-2 text-center">
                <button type="button" class="btn" style='font-size:35px;' @click="activity"><i class="bi bi-activity"></i></button>
                </div>
                <div class="col-2 text-center">
                <button type="button" class="btn" style='font-size:35px;' @click="logout"><i class="bi bi-box-arrow-right "></i></button><br>
                </div>
            </div>
        <!--// BOARD SECTION STARTS--> 
            <div class="row justify-content-center">
                <div id="dropzone" class="col-xl-1" @drop="deleteCard($event)"  @dragenter.prevent @dragover.prevent>
                </div>
                <list v-for="list in lists" v-bind:list=list v-bind:key=list.id></list>
                <div class="col-xl-1 col-lg-1 col-sm-1 col-md-1 col-xs-1 shadow-sm  listdiv" v-for="list in emptylist">
                <button class='form-control' id='addlist' @click=addlist><i class="bi bi-plus-circle"></i></button>
                </div>
                <div id="dropzone" class="col-xl-1" @drop="deleteCard($event)"  @dragenter.prevent @dragover.prevent>
                </div>
            </div>
            <div class="row" style="min-height:200px" @drop="deleteCard($event)"  @dragenter.prevent @dragover.prevent></div>           
        </div>
    </div>`,
data:function(){
    return {
        lists:{},
        username:this.$root.username
    }
},
methods:{
    activity:function(){
        this.$router.push('/activity')
    },
    logout:function(){
        this.$router.push(`/`)
    },
    addlist: async function(){
        await fetch(`/list`,{
            method: 'POST',
            headers:{
            'Content-type': 'application/json',
            'Authorization' : `Bearer ${store.token}`
            }
        })
        populatecards(store.userid)
    },
    deleteCard:function(event){
        deletecard(event)}
},
async beforeCreate(){
    populatecards()
    getusername()

},
computed:{
    emptyspace:function(){
        return 5 - Object.keys(this.lists).length
    },
    emptylist:function(){
        var empty = []
        for (var i=0;i<this.emptyspace;i++){empty.push(null)}
        return empty
    }
}
})


const routes = [
    { path: '/', component: Home },
    { path: '/signup', component: Signup },
    { path: '/kanban' , component: Kanban,props : true},
    { path: '/activity' , component: Activity}
  ]

const router = new VueRouter({routes,mode: 'history',})


var app = new Vue({
    el:"#vueapp",
    router,
    methods:{
        dropcard: async function(event,listid){
            var dropcard = event.dataTransfer.getData('text/plain')
            dropcard = JSON.parse(dropcard)
            var cardid = dropcard.cardid
            const response = await fetch(`/card/${cardid}`,{
                method: 'DELETE',
                headers: {
                'Content-type': 'application/json',
                'Authorization' : `Bearer ${store.token}`
                }            
            })
            
            populatecards(store.userid)
        }
    },
    data:function(){
        return {
            username:""
        }
    }
})


 async function populatecards(){
        var lists = await (await fetch(`/list/user`,{
                                                        method : 'GET',
                                                        headers: {
                                                            'Content-Type': 'application/json',
                                                            'Authorization' : `Bearer ${store.token}`
                                                        }
                                                    }
                                        )
                        ).json()

    var allcards = {}

    if(lists){
    for (let list of lists){
        var cards = await (await fetch(`/card/list/${list.listid}`,{
                                                                        method : 'GET',
                                                                        headers: {
                                                                            'Content-Type': 'application/json',
                                                                            'Authorization' : `Bearer ${store.token}`
                                                                        }
                                                                    }
                                        )
                        ).json()
        
        if (cards){
            cards.sort(function(card1,card2){
                if (card1.enddate < card2.enddate){return -1}
                else if(card1.enddate > card2.enddate){return 1}
                else return 0
            })
         }
        let stage = { id : list.listid, cards : cards, name : list.listname, content : list.content}
        allcards[list.listid] = stage
    }
    
 }
    app.$refs.kanban.lists = allcards
 }

 async function getusername(){

        const response = await fetch(`/user`,{
            method: 'GET',
            headers: {
            'Content-type': 'application/json',
            'Authorization' : `Bearer ${store.token}`
            }            
        }).then(data => data.json())
        .then(data => data)

        
        app.$refs.kanban.username = response.username
        app.username = response.username
        

}

 async function deletecard(event){
    var dropcard = event.dataTransfer.getData('text/plain')
        dropcard = JSON.parse(dropcard)
        var cardid = dropcard.cardid
        const response = await fetch(`/card/${cardid}`,{
            method: 'DELETE',
            headers: {
            'Content-type': 'application/json',
            'Authorization' : `Bearer ${store.token}`
            }            
        })
        populatecards()

}