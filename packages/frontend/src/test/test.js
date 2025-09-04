function MyInstanceOf(left, right){
  if(typeof left !== 'object' || left === null) return false
  let proto = Object.getPrototypeOf(left)
  let prototype = right.prototype
  while( proto !== null){
    if(proto === prototype) return true
    proto = Object.getPrototypeOf(proto)
  }
  return false
}

console.log(MyInstanceOf({},Object))