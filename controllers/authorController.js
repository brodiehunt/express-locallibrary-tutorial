const Author = require('../models/author');
const Book = require('../models/book');
const { body, validationResult } = require('express-validator');
const asyncHandler = require('express-async-handler');

// display list of all authors
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find().sort({ family_name: 1}).exec();
  res.render('author_list', {
    title: "Author list",
    author_list: allAuthors
  })
})

//  Display detail page for a specific author
exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec()
  ]);

  if (author === null) {
    const err = new Error("Author not found");
    err.status = 404;
    return next(err);
  }

  res.render("author_detail", {
    title: "Author Detail",
    author: author,
    author_books: allBooksByAuthor
  })
});


// display author create form on GET
exports.author_create_get = (req, res, next) => {
  res.render('author_form', {
    title: "Create Author"
  })
};

// Handle Author create on Post
exports.author_create_post = [
  body("first_name")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("First Name must be specified")
    .isAlphanumeric()
    .withMessage("First name has non-alphanumeric characters"),
  body("family_name")
    .trim()
    .isLength({min: 1})
    .escape()
    .withMessage("Family name must be specified")
    .isAlphanumeric()
    .withMessage("Family name has non-alphanumeric characters"),
  body("date_of_birth", "Invalid date of birth")
    .optional({values: "falsy"})
    .isISO8601()
    .toDate(),
  body("date_of_death", "Invalid Death date")
    .optional({values: 'falsy'})
    .isISO8601()
    .toDate(),
  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);
    const {first_name, family_name, date_of_birth, date_of_death} = req.body;
    const author = new Author({
      first_name,
      family_name,
      date_of_birth,
      date_of_death
    });

    if (!errors.isEmpty()) {
      res.render("author_form", {
        title: "Create Author",
        author,
        errors: errors.array()
      });
      return;
    } else {
      await author.save();
      res.redirect(author.url);
    }

  })
];

// author delete form on get 
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id}, "title summary").exec()
  ]);
  if (author === null) {
    // No results.
    res.redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});

// author delete form on post 
exports.author_delete_post = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    await Author.findByIdAndRemove(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

// author update form on get
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
});

// author update form on post
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});

