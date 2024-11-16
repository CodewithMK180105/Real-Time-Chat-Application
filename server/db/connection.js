const mongoose = require('mongoose');

const url=`mongodb+srv://chat_app_admin:admin1234@cluster0.lmiqk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

mongoose.connect(url,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=> console.log('Connect to DB')).catch((e)=>console.log("Error ", e));