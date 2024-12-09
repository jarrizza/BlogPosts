"use server";

// delete posts.db to clear the database

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { uploadImage } from '@/lib/cloudinary';
import { 
  storePost, 
  updatePostLikeStatus 
} from '@/lib/posts';

export async function createPost(prevState, formData) {
    const title = formData.get('title');
    const image = formData.get('image');
    const content = formData.get('content');

    let errors = [];

    if (!title || title.trim() === '') {
      errors.push('Title is required');
    }

    if (!content || content.trim() === '') {
      errors.push('Content is required');
    }

    if (!image || image.size === 0) {
      errors.push('Image is required');
    } 

    if (errors.length > 0) {
      return { errors };
    }

    let imageUrl;
    try {
        imageUrl = await uploadImage(image);
        console.log("imageUrl", imageUrl);
    } catch (error) {   
        throw new Error('Image upload failed, post was not created. Please try again later.');
     }

     try {
        await storePost({
          imageUrl,
          title,
          content,
          userId: 1
          });
      } catch (error) {
          throw new Error('Failed to create post');
      }

    revalidatePath('/', 'layout');
    redirect('/feed');
}

export async function togglePostLikeStatusFunc(postId) {
    try {
        await updatePostLikeStatus(postId, 2);
    } catch (error) {
        throw new Error('Failed to toggle like status');
    }

    revalidatePath('/', 'layout');
}
