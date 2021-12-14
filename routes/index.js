const express = require('express');
const indexRouter = express.Router();
const bcrypt = require('bcryptjs');
const { dbObject } = require("../db/db");
const { check, validationResult } = require("express-validator");
const passport = require("passport");
const moment = require("moment");
const { ensureAuthenticated } = require("../auth/authenticate");
const router = require('./admin');
const oracledb = require("oracledb");
const excel = require("exceljs");
const axios = require("axios");
const fs = require("fs");
var rfs = require('rotating-file-stream') // version 2.x
const path = require("path");
const xl = require('excel4node');
var toExcel = require('to-excel').toExcel;
const XLSX = require('xlsx');
const { Buffer, buffer } = require('Buffer');
const { ExportToCsv } = require('export-to-csv');




let logs = [];


router.use(async (req, res, next) => {
  
    levels = await dbObject.GetAllLevels();
    users = await dbObject.GetAllUsers();
    next();
  });


router.get('/', (req, res) => {
  res.status(200).render("login");
});

router.get("/login", (req, res) => {
    res.status(200).render("login");
  });

router.get("/dashboard", (req, res) => {
    res.render('dashboard', {logs})
});

router.get("/getLog", (req,res) => {
  res.render('dashboard', {logs})
})

router.get("/generateLogs", (req,res) => {
  res.render('dashboard', {logs})
})



//router for logging users in to their account after validation
router.post(
    "/login",
    [
      check("username")
        .not()
        .isEmpty()
        .withMessage("Please Provide a username")
        .trim()
        .escape(),
      check("password")
        .not()
        .isEmpty()
        .withMessage("Please provide your password."),
    ],
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    (req, res, next) => {
      const errors = validationResult(req).array();
      const { username, password } = req.body;
      if (errors.length > 0) {
        console.log("There was an error ")
        return res.render("login", { errors, username, password });
      } else {
        const { userLevel } = req.user[0];
        if (userLevel === 1) {
            
          return res.redirect("admin/admin-dashboard");
          
        } else {
            req.flash("success", "Successfully Logged In");
          
          return res.redirect("/dashboard");
        }
      }
    }
  );

//router for call log request
router.post("/getLog",  [
  check("msisdn")
    .not()
    .isEmpty()
    .withMessage("Please Provide a valid MSISDN")
    .trim()
    .escape(),
], async (req, res) => {

  //u nr even check if this error variable empty :(
  const errors = validationResult(req).array();

   const msisdn = req.body.msisdn;
  //  console.log(msisdn);
   const deviceByMSISDN = await dbObject.GetDeviceInfoByMSISDN(msisdn);
  
  logs  = deviceByMSISDN;

  
  req.flash("success", "Request made Successfully");
  return res.render("dashboard",{logs})

 });

  
//router for IMEI request
router.post(
  "/generateLogs",
   async (req, res, next) => {
    const errors = validationResult(req).array();
    

  const { from, to } = req.body;
  const deviceInfo = await dbObject.GetAllDeviceInfo(from, to);

  console.log(from);
  console.log(to);
  // return;

   logs  = deviceInfo;
  //  console.log(logs);
  //  return;

//    const options = { 
//     fieldSeparator: ',',
//     quoteStrings: '"',
//     decimalSeparator: '.',
//     showLabels: true, 
//     showTitle: true,
//     title: 'My Awesome CSV',
//     useTextFile: false,
//     useBom: true,
//     useKeysAsHeaders: true,
//     // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
//   };
 
// const csvExporter = new ExportToCsv(options);
 
// csvExporter.generateCsv(logs);
 

 
  
  // console.log(logs);
  // return;
  
   return res.render("dashboard",{logs})
  });



//logout
router.get("/logout", (req, res) => {
    req.logOut();
    req.flash("success", "Successfully Logged Out");
    res.redirect("/login");
  });

module.exports = router;