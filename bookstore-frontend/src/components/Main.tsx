import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listItems } from "../models/ListItems";
import classNames from "classnames";
import "../hover.scss";
import SingleBook from "./SingleBook";
import { FadeLoader } from "react-spinners";
import { IBook } from "../models/IBook";
import { booksApi } from "../services/booksApi";

function Main() {
  const styles = {
    background:
      "linear-gradient( rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4) ), url(img/ocean.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundAttachment: "fixed",
  };

  const navigate = useNavigate();

  const [books, setBooks] = useState<IBook[]>([]);
  const [rateBooks, setRateBooks] = useState<IBook[]>([]);

  const {
    data: newBooksData,
    isSuccess: newBooksSuccess,
    isLoading: newBooksLoading,
  } = booksApi.useGetNewBooksQuery(6);

  const { data: topRateBooksData, isSuccess: topRateBooksSuccess } =
    booksApi.useGetTopRateBooksQuery(3);

  useEffect(() => {
    if (newBooksSuccess) {
      setBooks(newBooksData.body!);
    }
  }, [newBooksData]);

  useEffect(() => {
    if (topRateBooksSuccess) {
      setRateBooks(topRateBooksData.body!);
    }
  }, [topRateBooksData]);

  const [listItem, setListItem] = useState(listItems[0]);

  const itemHandler = (id: number) => {
    const current = listItems.find((x) => x.id === id);

    current!.selected = true;

    listItem.selected = false;

    setListItem(current!);
  };

  const handleBookClick = (bookId: string) => {
    navigate(`/book/${bookId}`);
  };

  return (
    <div className="flex flex-col justify-center w-full h-full">
      <div
        style={styles}
        className="flex flex-col justify-center items-center h-[50rem] text-white"
      >
        <h1 className="text-[3rem] mb-10 font-extralight w-[40rem] text-center animate-pulse-slow">
          Join unique worlds and exciting stories with us
        </h1>
        <Link
          to="/signup"
          className="w-[10rem] slide py-3 text-center font-medium border-white border-2 but-anim"
        >
          Sign up
        </Link>
      </div>
      <div className="flex flex-row bg-[#E5E5E5] h-[40rem] text-[#0b090a]">
        <div className="flex justify-center items-center basis-1/2">
          <div className={listItem.imgStyle}></div>
        </div>
        <div className="flex flex-col text-[4rem] font-light justify-center basis-1/2">
          {listItems.map((item) => (
            <p
              key={item.id}
              className="flex flex-row cursor-pointer hover:text-[#457b9d] but-anim"
              onClick={() => itemHandler(item.id)}
            >
              <span
                className={classNames(
                  item.selected ? "block animate-line origin-left" : "hidden",
                  "text-[#457b9d]"
                )}
              >
                &mdash;
              </span>
              <span
                className={
                  item.selected
                    ? "item-selected text-[#457b9d] animate-line origin-left"
                    : ""
                }
              >
                {item.name}
              </span>
            </p>
          ))}
          <Link to="/books">
            <button className="learn-more text-sm text-left mt-5 w-[15rem]">
              <span className="circle" aria-hidden="true">
                <span className="icon arrow"></span>
              </span>
              <span className="button-text">See all categories</span>
            </button>
          </Link>
        </div>
      </div>
      <div className="flex flex-col bg-[#caf0f8] h-[45rem] relative">
        <h1 className="mt-10 text-center text-[2rem] basis-1/4">
          Popular books
        </h1>
        <div className="flex flex-row ml-10">
          <div className="flex flex-col justify-center pl-8 text-white bg-[#000814] w-[35rem] h-[22rem]">
            <h2 className="text-2xl tracking-wider mb-7 font-light">
              Be a part of famous works
            </h2>
            <p className="mb-7 text-sm w-[30rem]">
              Get the most famous and popular books from a variety of authors.
              Become a part of unimaginable worlds and experience the spirit of
              adventure, together with your loved heroes
            </p>
            <Link
              to="/books"
              className="w-[14rem] hover:shadow-button py-3 text-sm text-center border-white border-2 but-anim"
            >
              SEE ALL
            </Link>
          </div>
        </div>
        <img
          src={rateBooks[0] && rateBooks[0].cover}
          alt=""
          className="absolute w-[22rem] h-[30rem] bottom-20 left-[36rem] z-10 cursor-pointer raise but-anim"
          onClick={() => handleBookClick(rateBooks[0].id)}
        />
        <img
          src={rateBooks[1] && rateBooks[1].cover}
          alt=""
          className="absolute w-[22rem] h-[30rem] bottom-5 left-[52rem] cursor-pointer raise but-anim"
          onClick={() => handleBookClick(rateBooks[1].id)}
        />
        <img
          src={rateBooks[2] && rateBooks[2].cover}
          alt=""
          className="absolute w-[22rem] h-[30rem] bottom-20 right-[5.5rem] z-10 cursor-pointer raise but-anim"
          onClick={() => handleBookClick(rateBooks[2].id)}
        />
      </div>
      <div className="flex flex-col pb-5 bg-[#E5E5E5] min-h-[40rem] text-[#0b090a]">
        <h1 className="my-5 text-center text-[2rem]">New in store</h1>
        <div className="w-full flex flex-row flex-wrap justify-center">
          {newBooksLoading ? (
            <FadeLoader className="mt-10" />
          ) : books.length === 0 ? (
            <h1 className="text-left text-xl">Empty</h1>
          ) : (
            books.map((item) => (
              <div
                className="basis-1/5 bg-[#f3f3f3] my-5 mx-16 cursor-pointer but-anim
               hover:translate-y-[-0.5rem] hover:rotate-1 hover:shadow-[5px_5px_0px_0px_rgba(213,180,175)]"
                key={item.id}
                onClick={() => handleBookClick(item.id)}
              >
                <SingleBook {...item} />
              </div>
            ))
          )}
        </div>
      </div>
      {/* <div className="flex flex-row bg-[#caf0f8] h-[40rem]">
        <div className="basis-1/2"></div>
        <div className="flex flex-col items-center justify-center basis-1/2">
          <h1 className="text-3xl font-semibold text-red-600 tracking-wider mb-10">
            Hot sale!
          </h1>
          <p className="mb-16 text-xl w-[40rem] font-medium">
            Do not miss the opportunity to purchase popular books at a bargain
            price. The list of books changes every week.
          </p>
          <div className="mb-[10rem] relative">
            <Link
              to=""
              className="absolute w-[14rem] raise py-3 text-center right-10 hover:border-red-600 hover:text-red-600 border-black border-2 but-anim"
            >
              Buy now
            </Link>
            <Link
              to=""
              className="absolute w-[14rem] raise py-3 text-center hover:border-red-600 hover:text-red-600 border-black border-2 but-anim"
            >
              See details
            </Link>
          </div>
        </div>
      </div> */}
    </div>
  );
}

export default Main;
