const express = require("express");
const router = express.Router();
const path = require("path");
const { dbObject } = require("../db/db");
const fcontroller = require("../controllers/filecontroller");
const bcrypt = require("bcryptjs");
const { check } = require("express-validator");
const UserController = require("../controllers/UsersController");
const { ensureAuthenticated } = require("../auth/authenticate");
// const logFile = require("../log/access.log");
const isAdmin = 1;
let adminName = "";
let levels,
  users = [];

router.use(async (req, res, next) => {
  adminName = typeof req.user != "undefined" ? req.user.firstName : "";
  levels = await dbObject.GetAllLevels();
  users = await dbObject.GetAllUsers();
  next();
});


router.get("/admin-dashboard", ensureAuthenticated, (req, res, next) => {
  (async () => {
    try {
      if (req.user.userLevel == 1) {
        res.render("admin/admin-dashboard", {
          isAdmin,
          pageTitle: "Admin Dashboard",
          adminName,
          numberOfUser: users.length,
        });
        return;
      } else {
        res.redirect("/admin-dashboard");
      }
    } catch (error) {
      next(err);
    }
  })();
});

router.get("/create-user", ensureAuthenticated, (req, res) => {
    res.render("admin/create-user", {
      isAdmin,
      pageTitle: "Create User",
      adminName,
    });
  });

  router.get("/user-logs", ensureAuthenticated, (req, res) => {
    res.render("admin/user-logs", {
      isAdmin,
      pageTitle: "User Statistics",
      adminName,
    });
  });

  router.post("/upload", fcontroller.upload);
  router.get("/files", fcontroller.getListFiles);
  router.get("/files/:name", fcontroller.download);

  //route for getting all users
router.get("/create-user", ensureAuthenticated, UserController.GetAllUser);

  //route for adding a new user
router.post(
    "/create-user",
    [
      check("firstname")
        .not()
        .isEmpty()
        .withMessage("Please provide users firstname")
        .trim()
        .escape(),
      check("lastname")
        .not()
        .isEmpty()
        .withMessage("Please provide users lastname")
        .trim()
        .escape(),
      check("username")
        .not()
        .isEmpty()
        .withMessage("Please provide a username")
        .trim()
        .escape(),
      check("email")
        .not()
        .isEmpty()
        .withMessage("Please Provide an Email")
        .trim()
        .escape(),
      check("msisdn")
        .not()
        .isEmpty()
        .withMessage("Please Provide a valid Phone number")
        .trim()
        .escape(),
      check("userLevel")
        .not()
        .isEmpty()
        .withMessage("Select user's level")
        .trim()
        .escape(),
      check("password")
        .not()
        .isEmpty()
        .withMessage("Please provide your password.")
        .isLength({ min: 6, max: 50 })
        .withMessage("Password must be between 6-50 characters long"),
      check("password2")
        .not()
        .isEmpty()
        .withMessage("Enter confirm password")
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error("Password confirmation does not match password");
          }
         
          return true;
        }),
        
    ],
    
    UserController.AddNewUser
    
  );
  
  //route for deleting a user
  router.get(
    "/admin-dashboard/delete/:id",
    ensureAuthenticated,
    UserController.DeleteUserById
  );
module.exports = router;