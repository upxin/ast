function walk(ast, { enter, leave }) {
    visit(ast, null, enter, leave)
}
function visit(node, parent, enter, leave) {
    if (enter) {
        enter.call(null, node, parent)
    }
    let childKeys = Object.keys(node).filter(key => typeof node[key]==='object');
    childKeys.forEach(childKey=>{
        let value = node[childKey]
        if(Array.isArray(value)) {
            value.forEach(val => visit(val,node,enter,leave))
        } else {
            visit(value,node,enter,leave)
        }
    })
    if (leave) {
        leave.call(null, node, parent)
    }
}
module.exports = walk
  