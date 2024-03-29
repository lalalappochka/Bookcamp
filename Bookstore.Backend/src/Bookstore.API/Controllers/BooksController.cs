﻿using Bookstore.API.Extensions;
using Bookstore.API.Models;
using Bookstore.API.Models.AddBook;
using Bookstore.API.Models.AddReview;
using Bookstore.API.Models.GetBooks;
using Bookstore.API.Models.Rate;
using Bookstore.API.Services;
using Bookstore.API.Services.Contracts;
using Bookstore.Domain.Common.Contants;
using Bookstore.Domain.Models;
using Google.Apis.Books.v1;
using Google.Apis.Books.v1.Data;
using Google.Apis.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Serilog;

namespace Bookstore.API.Controllers
{
    [ApiController]
    [Route("api/[controller]/")]
    public class BooksController : ControllerBase
    {
        private readonly IBookService _booksService;
        private readonly BooksService _googleBooksService;

        public BooksController(IBookService booksService)
        {
            _booksService = booksService;
            _googleBooksService = new BooksService(new BaseClientService.Initializer
            {
                ApplicationName = "Bookcamp",
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetBook([FromRoute] string id)
        {
            var serverUrl = $"{Request.Scheme}://{Request.Host}";

            var response = await _booksService.GetOneBook(id, serverUrl);

            return response.ToOk();
        }

        [Authorize(Policy = "Admin")]
        [HttpPost("book")]
        public async Task<IActionResult> AddBook([FromForm] AddBookRequest request)
        {
            Volume? bookRes = await _googleBooksService.Volumes.Get(request.BookId).ExecuteAsync();

            if(bookRes is null)
            {
                return BadRequest();
            }

            var response = await _booksService.AddBook(bookRes, request.Fragments);

            return response.ToOk();
        }

        [HttpGet]
        public async Task<IActionResult> GetBooksPage([FromQuery] GetBooksRequest request)
        {
            var response = await _booksService.GetBooks(
                request.Page,
                request.PageSize,
                request.Keywords,
                request.Genre);

            return response.ToOk();
        }

        [HttpGet("author/{author}")]
        public async Task<IActionResult> GetBooksAuthor([FromRoute] string author,[FromQuery] string id)
        {
            var response = await _booksService.GetBooks(author, id);
            
            return response.ToOk();
        }

        [HttpGet("pages")]
        public IActionResult GetPages([FromQuery] int pageSize)
        {
            var response = _booksService.GetPages(pageSize);

            return response.ToOk();
        }

        [HttpGet("genres")]
        public async Task<IActionResult> GetGenres()
        {
            var result = await _booksService.GetGenres();

            return result.ToOk();
        }

        [HttpPost("review")]
        [Authorize(Policy = "User")]
        public async Task<IActionResult> AddReview([FromBody] AddReviewRequest request)
        {
            string id = HttpContext.GetUserId();

            var serverUrl = $"{Request.Scheme}://{Request.Host}";

            var response = await _booksService.AddReview(
                request.Review,
                request.BookId,
                id, 
                serverUrl);

            return response.ToOk();
        }

        [HttpGet("{bookId}/reviews")]
        public async Task<IActionResult> GetReviews([FromRoute] string bookId)
        {
            var response = await _booksService.GetReviews(bookId);

            return response.ToOk();
        }

        [HttpGet("{bookId}/user-review")]
        [Authorize(Policy = "User")]
        public async Task<IActionResult> GetReview([FromRoute] string bookId)
        {
            var userId = HttpContext.GetUserId();

            var response = await _booksService.IsUserAddedReview(bookId, userId);

            return response.ToOk();
        }

        [HttpPost("rate")]
        [Authorize(Policy = "User")]
        public async Task<IActionResult> AddRating([FromBody] AddRatingRequest request)
        {
            var userId = HttpContext.GetUserId();

            var response = await _booksService.AddRating(userId, request.BookId, request.Rate);

            return response.ToOk();
        }

        [HttpGet("rate")]
        [Authorize(Policy = "User")]
        public async Task<IActionResult> GetRating([FromQuery] string bookId)
        {
            var userId = HttpContext.GetUserId();

            var response = await _booksService.GetRating(userId, bookId);

            return response.ToOk();
        }

        [HttpGet("favourites")]
        [Authorize(Policy = "User")]
        public async Task<IActionResult> GetUserFavourites()
        {
            string id = HttpContext.GetUserId();

            var response = await _booksService.GetUserFavourites(id);

            return response.ToOk();
        }

        [HttpGet("new-books")]
        public async Task<IActionResult> GetNewBooks([FromQuery] int number)
        {
            var response = await _booksService.GetNewBooks(number);

            return response.ToOk();
        }

        [HttpGet("top-rate")]
        public async Task<IActionResult> GetTopRateBooks([FromQuery] int number)
        {
            var response = await _booksService.GetTopRateBooks(number);

            return response.ToOk();
        }

        [HttpGet("fragments/{id}/{ext}")]
        [Authorize(Policy = "User")]
        public async Task<IActionResult> GetFragment([FromRoute] string id, [FromRoute] string ext)
        {
            var response = await _booksService.GetFragment(id, ext);

            return response.Match<IActionResult>(success =>
            {
                Response.Headers.Add("Content-Disposition", $"inline; filename={success.FileName}");
                return File(success.Data, success.ContentType);

            }, ex =>
            {
                return BadRequest(new Response<string>(ex.Message));
            });
        }

        [HttpDelete("review/{id}")]
        [Authorize(Policy = "Admin")]
        public async Task<IActionResult> DeleteReview([FromRoute] string id)
        {
            var response = await _booksService.DeleteReview(id);

            return response.ToOk();
        }

        [HttpDelete("{id}")]
        [Authorize(Policy = "Admin")]
        public async Task<IActionResult> DeleteBook([FromRoute] string id)
        {
            var response = await _booksService.DeleteBook(id);

            return response.ToOk();
        }
    }
}
