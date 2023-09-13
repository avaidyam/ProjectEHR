import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

export default function Notewriter() {
  const [submitOption, setAge] = React.useState("");

  const handleChange = (event) => {
    setAge(event.target.value);
  };

  return (
    <form>
      <Editor
        wrapperClassName="wrapper"
        editorClassName="editor"
        toolbarClassName="toolbar"
      />
      <Box sx={{ display: "flex", flexDirection: "row-reverse" }}>
        <FormControl sx={{ m: 1, minWidth: 120 }}>
          <Button variant="contained" sx={{ height: "100%" }}>
            Submit
          </Button>
        </FormControl>
        <FormControl sx={{ m: 1, minWidth: 220 }} size="small">
          <Select
            id="selectSubmit"
            value={submitOption}
            onChange={handleChange}
            displayEmpty
          >
            <MenuItem value={0}>Pend on Accept</MenuItem>
            <MenuItem value={1}>Sign on Accept</MenuItem>
            <MenuItem value="">Sign when Signing Visit</MenuItem>
          </Select>
        </FormControl>
      </Box>
    </form>
  );
}
