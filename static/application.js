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
    props:['cardobj','cardselector','body'],
    template:
    `<div class="accordion">
    <div class="accordion-item mb-3">
        <h2 class="accordion-header" id="accordion"> 
            <button type="button" class="accordion-button  show collapse" data-bs-toggle="collapse" v-bind:data-bs-target="cardidele">{{ cardobj.cardtitle }}</button>
        </h2>
        <div class="accordion-collapse  show collapse" v-bind:id="cardselector">
            <div class="accordion-body">
                <div class="card" v-on:dblclick=editCard(cardobj.cardid)>
                <p class="card-text" v-if="notEditing">{{ cardobj.cardcontent }}</p>
                <input type=text class="form-control" v-else v-model="newcontent">
                </div>
            </div>
        </div>
        <div class="row">
        <div class="col-4">
        <button class="btn mt-1" v-on:click="deleteCard(cardobj.cardid)"><i class="bi bi-archive"></i></button>
        </div>
        <div class="col-4">
        <input class="form-check-input mt-3" data-toggle="tooltip" type="radio" id="completedradio" title="Mark Completed" v-on:change="something(cardobj.cardid)">
        </div>
        </div>
    </div>
</div>`,
computed:{
    cardidele:function(){
        return "#" + this.cardselector
    }
},
methods:{
    something:function(cardid){
        console.log(cardid)
    },
    deleteCard:function(cardid){
        console.log("Uda denge" + cardid)
    },
    editCard:function(cardid){
        this.notEditing = false
    }
},
data:function(){
    return {
        notEditing:true,
        newcontent:""
    }
},
}
)

const Kanban = Vue.component('kanban',{
    // props:['lists'],
    template:
    `<div class="container-fluid w-75" id="kanban">
        <div class="row">
            <div class="col-2 shadow-sm" v-for="list in lists">
                <ul class="nav nav-tabs">
                    <li class="nav-item">
                    <a class="nav-link" href="#">{{ list.id }}</a>
                    </li>
                </ul>
                <card v-for="card in list.cards" :key=card.cardid :cardselector='card.cardtitle + card.cardid' :cardobj=card>
                </card>
                <div class="row">
                <button type=button class="btn" v-on:click="addCard(list.id)"><i class="bi bi-plus-square"></i></button>
                </div>
            </div>   
        </div>           
    </div>`,
data:function(){
    return {
        lists:[{id:0,cards:[{cardid:1,cardtitle:"title",cardcontent:"content"},{cardid:6,cardtitle:"title",cardcontent:"Ao kabhi haveli pe"},{cardid:7,cardtitle:"title",cardcontent:"content"}]},
                {id:1,cards:[{cardid:2,cardtitle:"alag",cardcontent:"content"},{cardid:8,cardtitle:"alag",cardcontent:"content"}]},
                {id:3,cards:[{cardid:3,cardtitle:"title",cardcontent:"content"}]},
                {id:4,cards:[{cardid:4,cardtitle:"title",cardcontent:"content"}]},
                {id:5,cards:[{cardid:5,cardtitle:"title",cardcontent:"content"},{cardid:9,cardtitle:"alag",cardcontent:"content"}]},
            ]
    }
},
methods:{
    addCard:function(listid){
        console.log("Daal denge ji "+listid)
    }
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
        }
    }
})