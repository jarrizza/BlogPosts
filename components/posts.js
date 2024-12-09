"use client";

import { useOptimistic } from 'react';
import { formatDate } from '@/lib/format';
import LikeButton from './like-icon';
import { togglePostLikeStatusFunc } from '@/actions/posts';
import Image from 'next/image';

// https://console.cloudinary.com/console/c-a5d2862dad603f6cc1d9a8f3ea8b29/media_library/search?q=%7B%22searchByFolders%22%3A%5B%22nextjs-blogposts-mutations%22%5D%7D&view_mode=mosaic

function imageLoader(config) {
  const urlStart = config.src.split('upload/')[0];
  const urlEnd = config.src.split('upload/')[1];
  const transformations = `w_200,q_${config.quality}`;
  return `${urlStart}upload/${transformations}/${urlEnd}`;
}

function Post({ post, action }) {
  return (
    <article className="post">
      {post.image && 
        <div className="post-image">
          <Image
            loader={imageLoader} 
            src={post.image}
            alt={post.title}
            quality={50}
            width={200}
            height={120}
            priority
            />
        </div>}
      <div className="post-content">
        <header>
          <div>
            <h2>{post.title}</h2>
            <p>
              Shared by {post.userFirstName} on{' '}
              <time dateTime={post.createdAt}>
                {formatDate(post.createdAt)}
              </time>
            </p>
          </div>
          <div>
            <form 
              action={action.bind(null, post.id)} 
              className={post.isLiked ? 'liked' : ''}
              >
              <LikeButton />
            </form>
          </div>
        </header>
        <p>{post.content}</p>
      </div>
    </article>
  );
}

export default function Posts({ posts }) {

  const [optimisticPosts, updateOptimisticPosts] = useOptimistic(posts, (prevPosts, updatedPostId) => {
    const updatedPostIndex = prevPosts.findIndex((post) => post.id === updatedPostId); 
    if (updatedPostIndex === -1) {
      return prevPosts;
    } 
    const updatedPost = { ...prevPosts[updatedPostIndex] };
    updatedPost.likes = updatedPost.likes + (updatedPost.isLiked ? -1 : 1);
    updatedPost.isLiked = !updatedPost.isLiked;
    const newPosts = [...prevPosts];
    newPosts[updatedPostIndex] = updatedPost;
    return newPosts;
  });

  if (!optimisticPosts || optimisticPosts.length === 0) {
    return <p>There are no posts yet. Maybe start sharing some?</p>;
  }

  async function updatePost(postId) {
    updateOptimisticPosts(postId);
    try {
      await togglePostLikeStatusFunc(postId);
    } catch (error) {
      throw new Error('Failed on call to toggle Like Status');
    }
  }

  return (
    <ul className="posts">
      {optimisticPosts.map((post) => (
        <li key={post.id}>
          <Post post={post} action={updatePost} />
        </li>
      ))}
    </ul>
  );
}
