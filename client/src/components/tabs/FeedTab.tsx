import React, { ChangeEvent, FormEvent } from 'react';
import {
    Send, Loader2, Trash2, ImageIcon
} from 'lucide-react';

interface FeedTabProps {
    user: any;
    posts: any[];
    postContent: string;
    setPostContent: (c: string) => void;
    postImages: File[];
    setPostImages: (f: File[]) => void;
    postFileInputRef: React.RefObject<HTMLInputElement>;
    isLoadingAction: boolean;
    handleCreatePost: (e: FormEvent<HTMLFormElement>) => void;
    handleDeletePost: (id: string | number) => void;
    handlePostImageSelect: (e: ChangeEvent<HTMLInputElement>) => void;
    axiosBaseURL?: string;
}

const FeedTab: React.FC<FeedTabProps> = ({
    user,
    posts,
    postContent,
    setPostContent,
    postImages,
    postFileInputRef,
    isLoadingAction,
    handleCreatePost,
    handleDeletePost,
    handlePostImageSelect,
    axiosBaseURL
}) => {
    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5">
                <form onSubmit={handleCreatePost}>
                    <textarea
                        value={postContent}
                        onChange={(e) => setPostContent(e.target.value)}
                        placeholder="Aklınızdan neler geçiyor?"
                        className="w-full p-4 border border-gray-100 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition resize-none"
                        rows={3}
                    />
                    {postImages.length > 0 && (
                        <div className="flex gap-2 mt-3 overflow-x-auto py-2">
                            {postImages.map((file, index) => (
                                <div key={index} className="relative min-w-[80px] h-20 rounded-lg overflow-hidden border border-gray-200">
                                    <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center gap-2">
                            <input type="file" multiple accept="image/*" className="hidden" ref={postFileInputRef} onChange={handlePostImageSelect} />
                            <button type="button" onClick={() => postFileInputRef.current?.click()} className="flex items-center gap-2 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-4 py-2 rounded-lg transition font-medium text-sm">
                                <ImageIcon size={18} /> Resim Ekle ({postImages.length}/10)
                            </button>
                        </div>
                        <button type="submit" disabled={isLoadingAction} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg transition flex items-center gap-2">
                            {isLoadingAction ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Paylaş
                        </button>
                    </div>
                </form>
            </div>

            <div className="space-y-6">
                {posts.length === 0 ? (
                    <div className="text-center text-gray-500 py-10">Henüz hiç gönderi yok. İlk paylaşan sen ol!</div>
                ) : (
                    posts.map(post => (
                        <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-5 flex justify-between items-start">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-indigo-100 overflow-hidden">
                                        {post.author.profileImage?.fileId
                                            ? <img src={`${axiosBaseURL}/posts/image/${post.author.profileImage.fileId}`} alt="author" className="w-full h-full object-cover" />
                                            : <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold">{post.author.name?.charAt(0)}</div>
                                        }
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-800">{post.author.name}</h4>
                                        <p className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleString('tr-TR')}</p>
                                    </div>
                                </div>
                                {(user.id === post.authorId || user.role === 'SUPERADMIN') && (
                                    <button onClick={() => handleDeletePost(post.id)} className="text-gray-400 hover:text-red-500 transition p-1"><Trash2 size={18} /></button>
                                )}
                            </div>
                            {post.content && <div className="px-5 pb-4 text-gray-700 whitespace-pre-wrap">{post.content}</div>}
                            {post.images?.length > 0 && (
                                <div className={`grid gap-1 px-5 pb-5 ${post.images.length === 1 ? 'grid-cols-1' : post.images.length === 2 ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-3'}`}>
                                    {post.images.map((img: any) => (
                                        <div key={img.id} className="relative pt-[100%] rounded-lg overflow-hidden bg-gray-100">
                                            <img src={`${axiosBaseURL}/posts/image/${img.fileId}`} alt="post" className="absolute top-0 left-0 w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default FeedTab;
