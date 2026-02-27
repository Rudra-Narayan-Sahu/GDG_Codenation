import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, CheckCircle, Star, Search, Tag } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const ProblemsPage = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [topics, setTopics] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const endpoint = `${import.meta.env.VITE_API_URL}/api/problems/user-status`;
                const res = await axios.get(endpoint, { headers });
                setProblems(res.data);
            } catch (error) {
                console.error("Error fetching problems", error);
                // Fallback to public list if authenticated fails somehow
                try {
                     const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/problems`);
                     setProblems(res.data);
                } catch(e) {}
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [user]);

    useEffect(() => {
        if (problems.length > 0) {
            const allTopics = new Set();
            problems.forEach(p => {
                if (p.topics) {
                    p.topics.split(',').forEach(t => allTopics.add(t.trim()));
                }
            });
            setTopics([...allTopics].filter(Boolean));
        }
    }, [problems]);

    const filteredProblems = problems.filter(prob => {
        const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTopic = selectedTopic ? (prob.topics && prob.topics.split(',').map(t=>t.trim()).includes(selectedTopic)) : true;
        return matchesSearch && matchesTopic;
    });

    const getDifficultyColor = (difficulty) => {
        switch(difficulty) {
            case 'Easy': return 'text-green-400 bg-green-400/10 border-green-400/20';
            case 'Medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
            case 'Hard': return 'text-red-400 bg-red-400/10 border-red-400/20';
            default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center py-12 px-6">
            <div className="text-center max-w-3xl mb-8">
                <h1 className="text-4xl font-extrabold mb-4 text-[#07fc03]">
                    Problem Playground
                </h1>
                <p className="text-lg text-gray-400">
                    Select a challenge below and test your skills in our collaborative editor.
                </p>
            </div>

            {/* Filters Section */}
            <div className="w-full max-w-5xl mx-auto mb-8 flex flex-col md:flex-row gap-4">
                <div className="glass p-4 rounded-xl flex-grow md:w-1/3 flex items-center border border-[#07fc03]/20">
                    <Search size={18} className="text-[#07fc03] mr-3" />
                    <input 
                        type="text"
                        placeholder="Search challenges..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none text-white focus:outline-none"
                    />
                </div>
                <div className="glass p-4 rounded-xl flex-grow md:w-2/3 border border-[#07fc03]/20 flex flex-wrap items-center gap-2">
                    <Tag size={18} className="text-[#07fc03] mr-2 shrink-0" />
                    <button
                        onClick={() => setSelectedTopic('')}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                            selectedTopic === '' 
                            ? 'bg-[#07fc03] text-black shadow-[0_0_10px_rgba(7,252,3,0.3)]' 
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                        }`}
                    >
                        All Topics
                    </button>
                    {topics.map(topic => (
                        <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                                selectedTopic === topic 
                                ? 'bg-[#07fc03] text-black shadow-[0_0_10px_rgba(7,252,3,0.3)]' 
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                            }`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-5xl mx-auto overflow-x-auto pb-4">
                <div className="glass rounded-xl overflow-hidden min-w-[700px]">
                    <div className="grid grid-cols-12 gap-4 border-b border-gray-700 bg-gray-800/50 p-4 font-semibold text-gray-300">
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-6 pl-4">Title</div>
                        <div className="col-span-3 text-center">Difficulty</div>
                        <div className="col-span-2 text-center">Action</div>
                    </div>
                    
                    {loading ? (
                        <div className="p-8 text-center text-gray-400 animate-pulse">Loading problems...</div>
                    ) : filteredProblems.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">No problems found matching your criteria.</div>
                    ) : (
                        <div className="divide-y divide-gray-700/50">
                            {filteredProblems.map((prob) => (
                                <Link 
                                    to={`/problem/${prob.id}`} 
                                    key={prob.id}
                                    className={`grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-700/30 smooth-transition group ${prob.is_daily ? 'bg-[#07fc03]/5' : ''}`}
                                >
                                    <div className="col-span-1 flex justify-center text-gray-500">
                                        {prob.is_solved ? (
                                            <CheckCircle className="text-green-500" size={20} />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full border-2 border-gray-600"></div>
                                        )}
                                    </div>
                                    <div className="col-span-6 pl-4 font-medium text-gray-200 group-hover:text-[#07fc03] smooth-transition flex items-center space-x-2">
                                        <span>{prob.title}</span>
                                        {prob.is_daily && (
                                            <span className="flex items-center space-x-1 text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded-full">
                                                <Star size={10} fill="currentColor" />
                                                <span>Daily</span>
                                            </span>
                                        )}
                                    </div>
                                    <div className="col-span-3 flex justify-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(prob.difficulty)}`}>
                                            {prob.difficulty}
                                        </span>
                                    </div>
                                    <div className="col-span-2 flex justify-center">
                                        <button className="flex items-center space-x-1 text-sm bg-[#07fc03]/20 text-[#07fc03] hover:bg-[#07fc03] hover:text-black px-3 py-1.5 rounded-md smooth-transition">
                                            <Play size={14} />
                                            <span>Solve</span>
                                        </button>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProblemsPage;
