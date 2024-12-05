const port = 4000;
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect("mongodb+srv://tasreful11:123ruet@cluster0.xnka5.mongodb.net/e-commerce");

// API creation
app.get("/", (req, res) => {
    res.send("Express App is Running")
})

// Image Storage Engine
const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        return cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})





const upload = multer({ storage:storage })

// Creating Upload Endpoint for images
app.use('/images', express.static('upload/images'))
app.post("/upload", upload.single('product'), (req, res) => {
    res.json({
        success:1,
        image_url:`http://localhost:${port}/images/${req.file.filename}`
    })
})

// Schema for creating Products

const Product = mongoose.model("Product",{
    id:{
       type: Number,
       required:true, 
    },
    name:{
        type:String,
        required:true,
    },
    image:{
        type:String,
        required:true,
    },
    category:{
        type:String,
        required:true,
    },
    new_price:{
        type:Number,
        required:true,
    },
    old_price:{
        type:Number,
        required:true,
    },
    date:{
        type:Date,
        default:Date.now,
    },
    available:{
        type:Boolean,
        default:true,
    },
})
app.post('/addproduct',async (req,res)=>{
    let products = await Product.find({});
    let id;
    if(products.length>0)
    {
        let last_product_array = products.slice(-1);
        let last_product = last_product_array[0];
        id = last_product.id+1;
    }
    else{
        id=1;
    }
     const product = new Product({
        id:id,
        name:req.body.name,
        image:req.body.image,
        category:req.body.category,
        new_price:req.body.new_price,
        old_price:req.body.old_price,
     });
     console.log(product);
     await product.save();
     console.log("Saved");
     res.json({
        success:true,
        name:req.body.name,
     })
})

// Creating API for deleting Products
app.post('/removeproduct',async (req,res)=>{
    await Product.findOneAndDelete({id:req.body.id});
    console.log("Removed");
    res.json({
        success: true,
        name:req.body.name

    })
})

// Creating API for getting all products

app.get('/allproducts',async (req,res)=>{
    let products = await Product.find({});
    console.log("All Products Fetched");
    res.send(products);
})

// Schema Cerating for User Model
const Users = mongoose.model('Users',{
    name:{
        type:String,
    },
    email:{
        type:String,
        unique:true,
    },
    password:{
        type:String,
    },
    cartData:{
        type:Object,
    },
    date:{
        type:Date,
        default:Date.now,
    }
})

// Creating end point for registering the users

app.post('/signup',async(req,res)=>{
    let check = await Users.findOne({email:req.body.email});
    if(check){
        return res.status(400).json({success:false,errors:"existing user found for same email address"})
    }
    let cart = {};
    for(let i=0;i<300;i++){
        cart[i]=0;
    }
    const user = new Users({
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
        cartData:cart,
    })
    // Save user to the database
    await user.save();  

    const data = {
        user:{
            id:user.id
        }
    }
    const token = jwt.sign(data,'secret_ecom');
    res.json({success:true,token})
})

// creating endpoint for user logging

app.post('/login',async(req,res)=>{
    let user = await Users.findOne({email:req.body.email});
    if(user){
        const passCompare = req.body.password === user.password;
        if(passCompare){
            const data ={
                user:{
                    id:user.id
                }
            }
            const token = jwt.sign(data,'secret_ecom');
            res.json({success:true,token});
        }
        else{
            res.json({success:false,errors:"Wrong Password"});
        }
    }
    else{
        res.json({success:false,errors:"Wrong Email Id"});
    }
})

// creating endpoint for newcollection data
app.get('/newcollections',async(req,res)=>{
    let products = await Product.find({});
    let newcollection = products.slice(1).slice(-8);
    console.log("NewCollection Fetched");
    res.send(newcollection);
})

// creating endpoint for popular in men section
app.get('/popularinmen',async(req,res)=>{
    let products = await Product.find({category:"men"});
    let popular_in_man = products.slice(0,4);
    console.log("Popular in man Fetched");
    res.send(popular_in_man);
})


// creating middelware to fetch user 

const fetchuser = async(req,res,next)=>{
     const token = req.header('auth-token');
     if(!token)
     {
        res.status(401).send({errors:"Please authenticate using valid token"})

     }
     else{
        try{
          
            const data = jwt.verify(token,'secret_ecom');
            req.user = data.user;
            next();

        } catch (error) {
           
            res.status(401).send({errors:"Please authenticate using valid token"})
        }
     }
}

// creating endpoint for adding products in cart data

app.post('/addtocart', fetchuser, async (req, res) => {
    try {
        console.log("added",req.body.itemId);
      let userData = await Users.findOne({_id:req.user.id});
      userData.cartData[req.body.itemId] +=1;
      await Users.findOneAndUpdate({_id:req.user.id},{cartData:userData.cartData});
      res.send("Added")
     
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
  
// creating endpoint for remove product from cartdata

app.post('/removefromcart', fetchuser, async (req, res) => {
    try {
      console.log("Removing item", req.body.itemId);
  
      // Get the user data from the database
      let userData = await Users.findOne({ _id: req.user.id });
  
      // Ensure the cart exists for the user, and also check if the item exists in the cart
      if (!userData.cartData) {
        return res.status(400).json({ success: false, error: "Cart not found" });
      }
  
      // If the item exists in the cart and quantity is greater than 0, decrease the quantity
      if (userData.cartData[req.body.itemId] > 0) {
        userData.cartData[req.body.itemId] -= 1;
        
        // Update the cart data in the database
        await Users.findOneAndUpdate(
          { _id: req.user.id },
          { cartData: userData.cartData },
          { new: true } // Return the updated user data
        );
  
        // Send the updated cart data back to the client
        return res.json({ success: true, cartData: userData.cartData });
      }
  
      // If the item is not in the cart or quantity is 0, send a response indicating that
      return res.status(400).json({ success: false, error: "Item not in cart or quantity is already 0" });
  
    } catch (error) {
      console.error("Error removing item from cart:", error);
      res.status(500).json({ success: false, error: "Internal Server Error" });
    }
  });
  

//   Creating endpoint to get cartdata

app.post('/getcart', fetchuser, async (req, res) => {
    try {
      // Fetch the user from the database using the user ID
      const userData = await Users.findOne({ _id: req.user.id });
      
      if (!userData) {
        return res.status(404).json({ msg: "User not found" });
      }
  
      // Send the user's cart data
      res.json(userData.cartData);
    } catch (error) {
      console.error("Error fetching cart data:", error);
      res.status(500).json({ msg: "Internal server error" });
    }
  });
  
app.listen(port, (error) => {
    if (!error) {
        console.log("Server Running on Port " +port)
    } else {
        console.log("Error : " +error)
    }
})
