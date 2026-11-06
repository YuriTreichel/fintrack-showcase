<?php

namespace App\Http\Controllers;

use App\Models\BlogCategory;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * PUBLIC API: Get all published posts
     */
    public function indexPublic()
    {
        $posts = Post::with('blogCategory')
            ->where('is_published', true)
            ->orderBy('published_at', 'desc')
            ->get();

        return response()->json($posts);
    }

    /**
     * PUBLIC API: Get a single post by slug
     */
    public function showPublic($slug)
    {
        $post = Post::with('blogCategory')
            ->where('slug', $slug)
            ->where('is_published', true)
            ->firstOrFail();

        return response()->json($post);
    }

    /**
     * ADMIN API: Get all posts (published and unpublished)
     */
    public function indexAdmin(Request $request)
    {
        // Only allow demo@fintrack.dev
        if ($request->user()->email !== 'demo@fintrack.dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $posts = Post::with('blogCategory')->orderBy('created_at', 'desc')->get();

        return response()->json($posts);
    }

    /**
     * ADMIN API: Create a new post
     */
    public function store(Request $request)
    {
        if ($request->user()->email !== 'demo@fintrack.dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'boolean',
            'blog_category_id' => 'nullable|exists:blog_categories,id',
            'image' => 'nullable|image|max:5120', // Max 5MB
        ]);

        $data = $request->only(['title', 'content', 'is_published', 'blog_category_id']);

        // Generate unique slug
        $slug = Str::slug($data['title']);
        $originalSlug = $slug;
        $count = 1;
        while (Post::where('slug', $slug)->exists()) {
            $slug = "{$originalSlug}-{$count}";
            $count++;
        }
        $data['slug'] = $slug;

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blog', 'public');
            if ($path) {
                $data['image_url'] = '/storage/'.$path;
            }
        }

        if ($data['is_published'] ?? false) {
            $data['published_at'] = now();
        }

        $post = Post::create($data);

        return response()->json($post, 201);
    }

    /**
     * ADMIN API: Update an existing post
     */
    public function update(Request $request, $id)
    {
        if ($request->user()->email !== 'demo@fintrack.dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post = Post::findOrFail($id);

        $request->validate([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'is_published' => 'boolean',
            'blog_category_id' => 'nullable|exists:blog_categories,id',
            'image' => 'nullable|image|max:5120',
        ]);

        $data = $request->only(['title', 'content', 'is_published', 'blog_category_id']);

        // Update slug only if title changed
        if ($post->title !== $data['title']) {
            $slug = Str::slug($data['title']);
            $originalSlug = $slug;
            $count = 1;
            while (Post::where('slug', $slug)->where('id', '!=', $post->id)->exists()) {
                $slug = "{$originalSlug}-{$count}";
                $count++;
            }
            $data['slug'] = $slug;
        }

        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($post->image_url) {
                $oldPath = str_replace('/storage/', '', $post->image_url);
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('image')->store('blog', 'public');
            if ($path) {
                $data['image_url'] = '/storage/'.$path;
            }
        }

        // Handle publish date
        $isPublished = $data['is_published'] ?? false;
        if ($isPublished && ! $post->is_published) {
            $data['published_at'] = now();
        } elseif (! $isPublished) {
            $data['published_at'] = null;
        }

        $post->update($data);

        return response()->json($post);
    }

    /**
     * ADMIN API: Delete a post
     */
    public function destroy(Request $request, $id)
    {
        if ($request->user()->email !== 'demo@fintrack.dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post = Post::findOrFail($id);

        if ($post->image_url) {
            $oldPath = str_replace('/storage/', '', $post->image_url);
            Storage::disk('public')->delete($oldPath);
        }

        $post->delete();

        return response()->json(['message' => 'Post deleted successfully']);
    }

    /**
     * ADMIN API: Upload image for rich text editor
     */
    public function uploadImage(Request $request)
    {
        if ($request->user()->email !== 'demo@fintrack.dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'image' => 'required|image|max:5120',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('blog/content', 'public');

            return response()->json([
                'url' => '/storage/'.$path,
            ]);
        }

        return response()->json(['message' => 'No image uploaded'], 400);
    }

    /**
     * CATEGORIES
     */
    public function indexCategories()
    {
        $categories = BlogCategory::withCount(['posts' => function ($query) {
            $query->where('is_published', true);
        }])->orderBy('name')->get();

        return response()->json($categories);
    }

    public function storeCategory(Request $request)
    {
        if ($request->user()->email !== 'demo@fintrack.dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $category = BlogCategory::create([
            'name' => $request->name,
            'slug' => Str::slug($request->name),
        ]);

        return response()->json($category, 201);
    }

    public function destroyCategory(Request $request, $id)
    {
        if ($request->user()->email !== 'demo@fintrack.dev') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $category = BlogCategory::findOrFail($id);
        $category->delete();

        return response()->json(['message' => 'Category deleted successfully']);
    }
}
