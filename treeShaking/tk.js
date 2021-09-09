
// 从入口文件出发，找出所有它读取的变量，找一下这个变量是在哪里定义的，
// 把定义语句包含进来，而无关的代码一律抛弃，得到的即为我们想要的结果

// 对所有的 CallExpression 和 IDentifier 进行检测。
// 因为 CallExpression 代表了一次函数调用，因此在该 if 条件分支内，将相关函数节点调用情况推入到calledDecls数组中
// 同时对于该函数的参数变量也推入到calledDecls数组。因为 IDentifier 代表了一个变量的取值，我们也推入到calledDecls数组
const acorn = require("acorn")
const { default: MagicString } = require("magic-string");

const fs = require('fs')
const walk = require('./walk')
// 获取命令行参数
const buffer = fs.readFileSync('./test.js').toString()
const body = acorn.parse(buffer).body
let decls = {}
let calledDecls = []

const bundleStr = new MagicString.Bundle();  // 要打包的代码

let ident = 0
const padding = () => ' '.repeat(ident)
const magicString = new MagicString(buffer);
// 遍历处理
body.forEach(function (statement) {
    Object.defineProperties(statement, {
        // 变量定义
        _defines: { value: {} },

        // 变量依赖
        _dependsOn: { value: {} },

        // 变量语句
        _source: { value: magicString.snip(statement.start, statement.end) }, //存下当前语句对应的代码片段
    });
    function addToScope(declaration) {
        var name = declaration.id.name; // 获取声明的变量
        statement._defines[name] = statement._source.toString();// 找到所有声明 把声明作为key value：声明的表达式字符串存起来
    }
    walk(statement, {
        enter(node) {
            if (node.type) {
                switch (node.type) {
                    // 方法声明
                    case "FunctionDeclaration":
                        addToScope(node);
                        break;
                    // 变量声明
                    case "VariableDeclaration":
                        node.declarations.forEach(addToScope);
                        break;
                }
                // console.log(padding() + node.type + '进入')
                ident += 2
            }
        },
        leave(node) {
            if (node.type) {
                ident -= 2
                // console.log(padding() + node.type + '离开')
            }
        }
    });
    decls = { ...decls, ...statement._defines }
    console.log(123, decls)
    if (statement.type == "ExpressionStatement") {
        if (statement.expression.type == "CallExpression") {
            const callNode = statement.expression
            calledDecls.push(callNode.callee.name)
            const args = callNode.arguments
            for (const arg of args) {
                if (arg.type == "Identifier") {
                    calledDecls.push(arg.name)
                }
            }
        }
    }
});


console.log('calledDecls', calledDecls)
// 生成 code

// decls存储所有的函数或变量声明类型节点，
// calledDecls则存储了代码中真正使用到的数或变量声明
// code存储了其他所有没有被节点类型匹配的 AST 部分

calledDecls.forEach((called) => {
    const source = decls[called];
    bundleStr.addSource({
        content: source,
        separator: "\n",
    });
});

body.forEach(statement => {
    if (statement.type == "ExpressionStatement") {
        console.log(magicString.snip(statement.start, statement.end).toString())
        bundleStr.addSource({
            content: magicString.snip(statement.start, statement.end),
            separator: "\n",
        });
    }
})

code = bundleStr.toString()

fs.writeFileSync('test.shaked.js', code)

