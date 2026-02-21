/* Example: How to use Common Header */
import Header from './components/common-components/sidebar/Header';
import SearchBox from './components/common-components/seach-export/SearchBox';
import { buttonStyles } from './styles/buttonStyles';
import { useState } from 'react';

// Example 1: Header with only logo
<Header sidebarOpen={true} />

// Example 2: Header with heading
<Header 
    sidebarOpen={true}
    heading="Dashboard"
/>

// Example 3: Header with SearchBox
const [searchTerm, setSearchTerm] = useState('');
<Header 
    sidebarOpen={true}
    heading="Students"
    searchBox={<SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
/>

// Example 4: Header with buttons
<Header 
    sidebarOpen={true}
    heading="Faculty Management"
    buttons={
        <>
            <button className={buttonStyles.primary}>Add User</button>
            <button className={buttonStyles.secondary}>Export</button>
        </>
    }
/>

// Example 5: Header with SearchBox + Buttons (Complete)
const [searchTerm, setSearchTerm] = useState('');
<Header 
    sidebarOpen={true}
    heading="All Students"
    searchBox={<SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />}
    buttons={
        <>
            <button className={buttonStyles.primary}>Add Student</button>
            <button className={buttonStyles.secondary}>Export</button>
        </>
    }
/>
