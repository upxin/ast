const Scope = require('./scope')
let a = 'a'
function lev1() {
    let b = 'b'
    function lev2(age) {
        let c = 'c'
        console.log(a,b,c,age)
    }
    lev2('26')
}
lev1()
let globelScope = new Scope({
    name:'golbal',params :[],parent :null
})
globelScope.add('a')
let lev1Scope = new Scope({
    name:'lve1Scope',params:[],parent:globelScope
})
lev1Scope.add('b')
let lev2Scope = new Scope({
    name:'lve2Scope',params:['age'],parent:lev1Scope
})
lev2Scope.add('c')

lev2Scope.findDefiningScope();

// console.log(lev1Scope.findDefiningScope('a'))
console.log(lev2Scope.findDefiningScope('age'))
