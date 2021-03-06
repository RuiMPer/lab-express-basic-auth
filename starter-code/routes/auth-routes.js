const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const bcryptSalt = 10;

const User = require("../models/user");

//signup route
router.get("/signup", (req, res, next) => {
	try {
		res.render("auth/signup");
	} catch (e) {
		next(e);
	}
});

//login route
router.get("/login", (req, res, next) => {
	try {
		res.render("auth/login");
	} catch (e) {
		next(e);
	}
});

//Logout route
router.get("/logout", (req, res, next) => {
	req.session.destroy(() => {
		res.redirect("/");
	});
});

// signup POST
router.post("/signup", (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;
	const salt = bcrypt.genSaltSync(bcryptSalt);
	const hashPass = bcrypt.hashSync(password, salt);

	//Making sure username and password are not empty
	if (username === "" || password === "") {
		res.render("auth/signup", {
			errorMessage: "Indicate a username and password",
		});
		return;
	}
	//Making sure that user doesn't exist already
	User.findOne({ username: username }).then((user) => {
		if (user !== null) {
			res.render("auth/signup", {
				errorMessage: "The username already exists",
			});
			return;
		}
		User.create({ username, password: hashPass })
			.then(() => {
				res.redirect("/");
			})
			.catch((error) => {
				next(error);
			});
	});
});

//login POST
router.post("/login", (req, res, next) => {
	const username = req.body.username;
	const password = req.body.password;

	//TODO add fallbacks
	if (!username || !password) {
		res.render("auth/login", {
			errorMessage: "Indicate a username and password",
		});
		return;
	}

	User.findOne({ username: username }).then((user) => {
		//TODO check if the user exists
		if (!user) {
			res.render("auth/login", {
				errorMessage: "The username doesn't exist",
			});
		}
		if (bcrypt.compareSync(password, user.password)) {
			req.session.currentUser = user;
			res.redirect("/");
		} else {
			res.render("auth/login", {
				errorMessage: "Incorrect password",
			});
		}
	});
});

module.exports = router;
