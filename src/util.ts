

export const randomHash = (len:number):string=>{
        const options = "qwertyuiopasdfghjklzxcvbnm1234567890"
        const options_len = options.length
        let ans =''
        for (let i=0 ; i<len ;i++){
                ans+=options[Math.floor(Math.random() * options_len)]
        }
        return ans
}