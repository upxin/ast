
// 从入口文件出发，找出所有它读取的变量，找一下这个变量是在哪里定义的，
// 把定义语句包含进来，而无关的代码一律抛弃，得到的即为我们想要的结果

// 对所有的 CallExpression 和 IDentifier 进行检测。
// 因为 CallExpression 代表了一次函数调用，因此在该 if 条件分支内，将相关函数节点调用情况推入到calledDecls数组中
// 同时对于该函数的参数变量也推入到calledDecls数组。因为 IDentifier 代表了一个变量的取值，我们也推入到calledDecls数组
const acorn = require("acorn")
const JSEmitter = require('./emitter')
const fs = require('fs')
const walk = require('./walk')
// 获取命令行参数
const args = process.argv[2];
const buffer = fs.readFileSync(args).toString()
const body = acorn.parse(buffer).body
const jsEmitter = new JSEmitter()
let decls = new Map()
let calledDecls = []
let code = []
let ident = 0
const padding = () => ' '.repeat(ident)
// 遍历处理
body.forEach(function(statement) {

    walk(statement,{
        enter(node){
            if(node.type) {
                console.log(padding()+node.type+'进入')
                ident+=2
            }
        },
        leave(node){
            if(node.type) {
                ident-=2
                console.log(padding()+node.type+'离开')
            }
        }
    });
    if (statement.type == "FunctionDeclaration") {
        const code = jsEmitter.run([statement])
        decls.set(jsEmitter.visitNode(statement.id), code)
        return;
    }
    if (statement.type == "ExpressionStatement") {
        if (statement.expression.type == "CallExpression") {
            const callNode = statement.expression
            calledDecls.push(jsEmitter.visitIdentifier(callNode.callee))
            const args = callNode.arguments
            for (const arg of args) {
                if (arg.type == "Identifier") {
                    calledDecls.push(jsEmitter.visitNode(arg))
                }
            }
        }
    }
    if (statement.type == "VariableDeclaration") {
        const kind = statement.kind
        for (const decl of statement.declarations) {
            decls.set(jsEmitter.visitNode(decl.id), jsEmitter.visitVariableDeclarator(decl, kind))
        }
        return
    }
    if (statement.type == "Identifier") {
        calledDecls.push(statement.name)
    }
    code.push(jsEmitter.run([statement]))
});
// 生成 code

// decls存储所有的函数或变量声明类型节点，
// calledDecls则存储了代码中真正使用到的数或变量声明
// code存储了其他所有没有被节点类型匹配的 AST 部分

code = calledDecls.map(c => {
    return decls.get(c)
}).concat([code]).join('')
fs.writeFileSync('test.shaked.js', code)
console.log(123)

