import React from "react"

import "./style.css"

export const Component = () => {
    return (
        <div id="webcrumbs">
            ```jsx
            <div className="w-[800px] bg-gray-900 text-white p-6 rounded-lg shadow-lg">
                <div className="flex border-b border-gray-700 mb-6">
                    <button
                        className="px-4 py-2 mr-4 font-semibold hover:text-blue-400 transition-colors duration-200 border-b-2 border-blue-500 focus:outline-none"
                        onClick={() => {
                            const tabs = document.querySelectorAll("[data-tab]")
                            const sections = document.querySelectorAll("[data-section]")
                            tabs.forEach((tab) => tab.classList.remove("border-blue-500", "text-blue-400"))
                            event.target.classList.add("border-blue-500", "text-blue-400")
                            sections.forEach((section) => {
                                section.classList.add("hidden")
                                if (section.getAttribute("data-section") === event.target.getAttribute("data-tab")) {
                                    section.classList.remove("hidden")
                                }
                            })
                        }}
                        data-tab="friends"
                    >
                        Friends
                    </button>
                    <button
                        className="px-4 py-2 mr-4 font-semibold hover:text-blue-400 transition-colors duration-200 border-b-2 border-transparent focus:outline-none"
                        onClick={() => {
                            const tabs = document.querySelectorAll("[data-tab]")
                            const sections = document.querySelectorAll("[data-section]")
                            tabs.forEach((tab) => tab.classList.remove("border-blue-500", "text-blue-400"))
                            event.target.classList.add("border-blue-500", "text-blue-400")
                            sections.forEach((section) => {
                                section.classList.add("hidden")
                                if (section.getAttribute("data-section") === event.target.getAttribute("data-tab")) {
                                    section.classList.remove("hidden")
                                }
                            })
                        }}
                        data-tab="add-friends"
                    >
                        Add Friends
                    </button>
                    <button
                        className="px-4 py-2 font-semibold hover:text-blue-400 transition-colors duration-200 border-b-2 border-transparent focus:outline-none"
                        onClick={() => {
                            const tabs = document.querySelectorAll("[data-tab]")
                            const sections = document.querySelectorAll("[data-section]")
                            tabs.forEach((tab) => tab.classList.remove("border-blue-500", "text-blue-400"))
                            event.target.classList.add("border-blue-500", "text-blue-400")
                            sections.forEach((section) => {
                                section.classList.add("hidden")
                                if (section.getAttribute("data-section") === event.target.getAttribute("data-tab")) {
                                    section.classList.remove("hidden")
                                }
                            })
                        }}
                        data-tab="requests"
                    >
                        Requests
                    </button>
                </div>

                <div data-section="friends" className="space-y-4">
                    <h2 className="text-xl font-bold mb-4">Your Friends</h2>

                    <div className="bg-gray-800 p-4 rounded-lg flex items-center transition-all duration-300 hover:bg-gray-700 hover:shadow-md cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                            alt="User 1"
                            className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div>
                            <h3 className="font-semibold">Alex Johnson</h3>
                            <p className="text-gray-400 text-sm">Online</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg flex items-center transition-all duration-300 hover:bg-gray-700 hover:shadow-md cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                            alt="User 2"
                            className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div>
                            <h3 className="font-semibold">Emily Wilson</h3>
                            <p className="text-gray-400 text-sm">Last seen 2h ago</p>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg flex items-center transition-all duration-300 hover:bg-gray-700 hover:shadow-md cursor-pointer">
                        <img
                            src="https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                            alt="User 3"
                            className="w-12 h-12 rounded-full object-cover mr-4"
                        />
                        <div>
                            <h3 className="font-semibold">Michael Chen</h3>
                            <p className="text-gray-400 text-sm">Online</p>
                        </div>
                    </div>
                </div>

                <div data-section="add-friends" className="hidden space-y-4">
                    <h2 className="text-xl font-bold mb-4">Add Friends</h2>

                    <div className="flex mb-6">
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="bg-gray-800 text-white px-4 py-2 rounded-l-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-r-lg transition-colors duration-200">
                            <span className="material-symbols-outlined">search</span>
                        </button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-md">
                        <div className="flex items-center">
                            <img
                                src="https://images.unsplash.com/photo-1527980965255-d3b416303d12?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                                alt="User 4"
                                className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                                <h3 className="font-semibold">David Kim</h3>
                                <p className="text-gray-400 text-sm">Suggested Friend</p>
                            </div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none">
                            Add Friend
                        </button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-md">
                        <div className="flex items-center">
                            <img
                                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                                alt="User 5"
                                className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                                <h3 className="font-semibold">Sarah Miller</h3>
                                <p className="text-gray-400 text-sm">Friend of Friend</p>
                            </div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none">
                            Add Friend
                        </button>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-md">
                        <div className="flex items-center">
                            <img
                                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                                alt="User 6"
                                className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                                <h3 className="font-semibold">James Taylor</h3>
                                <p className="text-gray-400 text-sm">Recommended</p>
                            </div>
                        </div>
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none">
                            Add Friend
                        </button>
                    </div>
                </div>

                <div data-section="requests" className="hidden space-y-4">
                    <h2 className="text-xl font-bold mb-4">Friend Requests</h2>

                    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-md">
                        <div className="flex items-center">
                            <img
                                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                                alt="User 7"
                                className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                                <h3 className="font-semibold">Robert Garcia</h3>
                                <p className="text-gray-400 text-sm">Sent 2 days ago</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none">
                                Accept
                            </button>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none">
                                Reject
                            </button>
                        </div>
                    </div>

                    <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-between transition-all duration-300 hover:bg-gray-700 hover:shadow-md">
                        <div className="flex items-center">
                            <img
                                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&q=80"
                                alt="User 8"
                                className="w-12 h-12 rounded-full object-cover mr-4"
                            />
                            <div>
                                <h3 className="font-semibold">Olivia Martinez</h3>
                                <p className="text-gray-400 text-sm">Sent 5 hours ago</p>
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none">
                                Accept
                            </button>
                            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none">
                                Reject
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            ```
        </div>
    )
}
