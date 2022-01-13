const express = require("express");
const { User, validateUser } = require("../models/user");
const { Plan, validatePlan } = require("../models/plan");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const prouter = express.Router();
// router.post("/plans", async (req, res) => {

//     const { error } = validatePlan(req.body);
//     if (error) return res.status(400).json({ message: error.details[0].message });


//   })
//prouter.use("/plans", plansRouter)
const errorHandler = (func) => {
    return (req, res, next) => {
        try {
            func(req, res, next)
        } catch (error) {
            next(error)
        }
    }
}

prouter.get("/", errorHandler(async(req, res) => {
  
    
    if(req.user.isAdmin)
    {
        const plans = await Plan.find().populate("users", "email -_id")
    
res.json(plans)}

else {
  const plan= await Plan.find()

  const arr1=[]

  plan.forEach(element => {
      arr1.push({ id: element.id, name: element.name, price: element.price})
     
      
  });
    
res.json(arr1)

}
   // res.status(401).json({ message: "must be auth" })
}))

//post


prouter.post("/", async (req, res) => {
    if(req.user.isAdmin){
        const { error } = validatePlan(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message });
       
        const plan = new Plan(req.body);
        const result = await plan.save();
        res.status(201).json(result)
    }
    else{
    res.status(401).json({ message: "must be admin" })
    }
})


//put
prouter.put("/:id", async (req, res) => {
  const { error } = validatePlan(req.body);
        if (error) return res.status(400).json({ message: error.details[0].message })

    if(req.user.isAdmin){
        const plan = await Plan.findById(req.params.id);
    plan.name = req.body.name
    plan.price = req.body.price
    await plan.save();
    res.json(plan)

    }
    else{
    res.status(401).json({ message: "must be admin" })
    }
})

//delete


prouter.delete("/:id", async (req, res) => {
    if (req.user.isAdmin){
        const result = await Plan.findByIdAndDelete(req.params.id);
        res.json(result)
    }
   else
   {
    res.status(401).json({ message: "must be admin" })
   }
})



///////////subscribe////////////

prouter.put("/subscribe/:id", async (req, res) => {
    
        const plan = await Plan.findById(req.params.id);
        //const user = await User.findById(req.body.id)
   
        const ID = req.body._id
        if(!ID) return res.status(404).json({message:"user not found"})
        
         plan.users.push(ID)
          await plan.save();
         res.json(plan)

         res.json({message:"user is subscribed"})
})



prouter.delete("/unsubscribe/:id", async (req, res) => {
   
        const plan = await Plan.findById(req.params.id);
        //const user = await User.findById(req.body.id)
   
        const ID = req.body._id
        if(!ID) return res.status(404).json({message:"user not found"})
            plan.users.remove(ID)
        
    
    await plan.save();
    res.json({message:"user is deleted from subscribtion"})

    
    
    
})








module.exports = prouter