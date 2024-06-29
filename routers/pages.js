const express = require("express");
const pagesRouter = express.Router();

const formDataParser = express.urlencoded({ extended: false });
const pagesController = require("../controllers/pages_controller");
const { logUserIn, signUserUp } = require("../controllers/auth_controller");
const { authIniteSessionAndRedirect, authDestroySessionAndRedirect } = require("../middlewares/authContext");
const { ValidationError, AuthError } = require("../errors");


async function formErrorHandler(err, req, _resp, next) {
    if (err instanceof ValidationError || err instanceof AuthError) {
    
        req.__pageContext = {
            ...req.__pageContext,
            data: req.body,
            errors: err.errors
        }

        delete req.__pageContext.data.password; 

        return next();
    }

    next(err);
}

pagesRouter.use(pagesController.addPageContext);


pagesRouter.get("/",
    pagesController.getAllPosts,
    pagesController.renderPage("pages/index")
)

pagesRouter.route("/login")
    .get(pagesController.renderPage("pages/login"))
    .post(
        formDataParser,
        logUserIn,
        authIniteSessionAndRedirect(),
        formErrorHandler,
        pagesController.renderPage("pages/login")
    )

pagesRouter.route("/signup")
    .get(pagesController.renderPage("pages/signup"))
    .post(
        formDataParser,
        signUserUp,
        authIniteSessionAndRedirect(),
        formErrorHandler,
        pagesController.renderPage("pages/signup")
    )

pagesRouter.get("/logout", authDestroySessionAndRedirect())

pagesRouter.get("/my-posts",
    pagesController.checkAuth,
    pagesController.getUserPosts,
    pagesController.renderPage("pages/my-posts")
)

pagesRouter.get("/post-details/:postId",
    pagesController.getPostById,
    pagesController.renderPage("pages/post-details")
)

pagesRouter.route("/add-post")
    .all(
        pagesController.checkAuth
    )
    .get(pagesController.renderPage("pages/add-post"))
    .post(
        formDataParser,
        pagesController.createNewPost,
        formErrorHandler,
        pagesController.renderPage("pages/add-post")
    )

pagesRouter.post("/add-comment",
    pagesController.checkAuth,
    formDataParser,
    pagesController.createNewComment,
    formErrorHandler,
    (_req, resp, _next) => {
        resp.redirect("back")
    }
)


module.exports = {
    pagesRouter
}