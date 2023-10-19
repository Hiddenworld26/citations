import React, { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Button from '@mui/material/Button';
import axios from 'axios';
import citeproc from 'citeproc';
import UnfoldLessIcon from '@mui/icons-material/UnfoldLess';
import SkipPreviousIcon from '@mui/icons-material/SkipPrevious';
import SkipNextIcon from '@mui/icons-material/SkipNext';
import FilterIcon from '@mui/icons-material/Filter';

import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import './Style.css';

const CitationGenerator = () => {
  const [open, setOpen] = useState(false);
  const [inputData, setInputData] = useState({});
  const [selectedStyle, setSelectedStyle] = useState('APA');
  const [citations, setCitations] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      const response = await axios.post('https://api.gyanibooks.com/search_publication/', {
        keyword: inputData.title, 
        limit: 1,
      });

      if (response.data && response.data.length > 0) {
        const apiResponse = response.data[0];
        const bibtexEntry = {
          entryType: 'article',
          fields: {
            title: apiResponse.title,
            author: apiResponse.author,
            year: apiResponse.year.toString(),
            journal: apiResponse.journal,
            volume: apiResponse.volume,
            number: apiResponse.number,
            pages: apiResponse.pages,
            publisher: apiResponse.publisher,
          },
        };

        const sys = {
          retrieveItem: function (id) {
            return bibtexEntry;
          },
        };

        const engine = new citeproc.CSL.Engine(sys, selectedStyle);

        const result = engine.updateItems([1]);
        setCitations(apiResponse.citationStyles.map(style => engine.previewCitationCluster(style)));
      }
    } catch (error) {
      console.error('Error fetching data from the API:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='popup'>
        <TextField className='inputbox' type="text" placeholder='AI Commands'></TextField>
        
      <Button className='btn' variant="outlined" onClick={handleClickOpen}>
       Cite
      </Button>
      <TextField className='inputbox' type="text" placeholder='Text'></TextField>
      <div className='icons'>
      <UnfoldLessIcon/>
      <SkipPreviousIcon/>
      <SkipNextIcon/>
      <FilterIcon/>
      </div>
      <TextField className='inputbox' type="text" value="3" max="30" min="2"></TextField>
      <Dialog open={open} onClose={handleClose}>
        <div>
          <TextField
            label="Title" // User enters the title for the search
            fullWidth
            onChange={(e) => setInputData({ ...inputData, title: e.target.value })}
          />
          <TextField
            select
            label="Citation Style"
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
          >
            <MenuItem value="APA 7">APA 7</MenuItem>
            <MenuItem value="MLA 9">MLA 9</MenuItem>
            <MenuItem value="Chicago">Chicago</MenuItem>
            <MenuItem value="IEEE">IEEE</MenuItem>
            {/* Add more styles as needed */}
          </TextField>
          <Button onClick={handleSubmit}>Generate Citations</Button>
        </div>
      </Dialog>
      {loading && <p>Loading...</p>}
      {citations.length > 0 && (
        <div>
          <h3>Citations</h3>
          <ul>
            {citations.map((citation, index) => (
              <li key={index}>{citation}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default CitationGenerator;
