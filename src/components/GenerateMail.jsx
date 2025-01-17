import { Box } from "@mui/system";
import React, { useEffect, useState } from "react";
import { Formik } from "formik";
import * as yup from "yup";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Alert,
  AlertTitle,
  Autocomplete,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import LaunchIcon from "@mui/icons-material/Launch";
import { useNavigate } from "react-router-dom";
import { sign_in, verify_token } from "../apis/Authenticate";
import moment from "moment";
import MUIRichTextEditor from 'mui-rte'
import { send_mail } from "../apis/Mail";

const GenerateMail = () => {
  const [error, seterror] = useState(false);
  const [errormessage, seterrormessage] = useState("");
  const [submit_generate, setsubmit_generate] = useState(false);
  const [toggle_generate, settoggle_generate] = useState(false);
  const [loading, setloading] = useState(false);
  const [send_data, setsend_data] = useState({});
  const [groupGenerate, setgroupGenerate] = useState(false);
  const [group, setGroup] = useState(false);
  const [groupLoading, setgroupLoading] = useState(false);
  const [date, setdate] = useState("2017-05-24T10:30");
  const [body, setbody] = useState("");
  const navigate = useNavigate();
  


  const handleGroupGenerate = () => setgroupGenerate(!groupGenerate);
  const handleDateChange = (event) => setdate(event.target.value);


  const send_generate_mail = async () => {
    console.log(send_data)
    seterror(false);
    try {
      let response = await send_mail(send_data.recipient,send_data.sender,send_data.subject,send_data.group,send_data.body,send_data.date);
      console.log(response);
      if (response.data.status === "Success") {
        // localStorage.setItem("token", response.data.jwt);
        // navigate("/dashboard");
      } else if (response.data.message === "Invalid username or password!") {
        seterror(true);
        seterrormessage(response.data.message);
      }
    } catch (error) {
      console.error(error.message);
      seterror(true);
      seterrormessage("Internal Server Error");
    }
  };

  useEffect(() => {

    // verify token each time
    verify_token().then((res) => {
      if (res.data.status === "Fail") {
        navigate("/auth/login");
      }
    })
    .catch((err) => {
      navigate("/auth/login");
    });

    // submit generate mail request
    if (submit_generate) {
      send_generate_mail();
    }
  }, [toggle_generate]);

  const handleSubmit = (values) => {
    setsend_data({recipient:values.recipient,sender:values.sender,subject:values.subject,group:group,body:values.body,date:date});
    setsubmit_generate(true);
    settoggle_generate(!toggle_generate);
    // console.log(values);
  };

  const isNonMobile = useMediaQuery("(min-width:600px)");

  const checkoutSchema = yup.object().shape({
    recipient: yup.string().required("required"),
    sender: yup.string(),
    subject: yup.string().required("required"),
    body: yup.string().required("required")
  });
  const initialValues = {
    recipient: "",
    sender: "",
    subject: "",
    group: [],
    body: ""
  };

  return (
    <Box
      display="flex"
      width="100%"
      justifyContent={"space-evenly"}
      sx={{
        padding: "5px 40px",
      }}
    >
      <Box
        width={"100%"}
        maxWidth="80vw"
        sx={{
          padding: "10px 30px",
        }}
      >
        <Formik
          onSubmit={handleSubmit}
          initialValues={initialValues}
          validationSchema={checkoutSchema}
        >
          {({
            values,
            errors,
            touched,
            handleBlur,
            handleChange,
            handleSubmit,
          }) => (
            <form onSubmit={handleSubmit}>
              {error ? (
                <Alert
                  severity="error"
                  sx={{
                    marginBottom: "5vh",
                  }}
                >
                  <AlertTitle
                    sx={{
                      fontWeight: "bolder",
                    }}
                  >
                    Error
                  </AlertTitle>
                  This is an error alert — <strong>{errormessage}</strong>
                </Alert>
              ) : null}
              <Typography
                variant="h3"
                style={{ fontWeight: "bolder", marginBottom: "20px" }}
              >
                Generate Mail 👋
              </Typography>
              <Typography
                variant="h5"
                style={{ fontWeight: "bolder", marginBottom: "20px" }}
              >
                Please use it carefully before generating group mail !
              </Typography>
              <Box
                display="grid"
                gap="30px"
                gridTemplateColumns="repeat(4, minmax(0, 1fr))"
                sx={{
                  "& > div": { gridColumn: isNonMobile ? undefined : "span 2" },
                }}
              >
                <Stack
                  spacing={1}
                  sx={{ gridColumn: "span 4" }}
                  direction="row"
                >
                  <TextField
                    fullWidth
                    variant="outlined"
                    type="email"
                    label="Recipient"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    value={values.recipient}
                    name="recipient"
                    error={!!touched.recipient && !!errors.recipient}
                    helperText={touched.recipient && errors.recipient}
                    sx={{ width: "span 2" }}
                  />
                  <TextField
                  fullWidth
                  variant="outlined"
                  type="sender"
                  label="Sender"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.sender}
                  name="sender"
                  error={!!touched.sender && !!errors.sender}
                  helperText={touched.sender && errors.sender}
                  sx={{ gridColumn: "span 2" }}
                />
                </Stack>
                {
                  groupGenerate && <Autocomplete
                  id="asynchronous-demo"
                  multiple
                  sx={{ gridColumn: "span 4" }}
                  open={group}
                  onOpen={() => {
                    setGroup(true);
                  }}
                  onClose={() => {
                    setGroup(false);
                  }}
                  name="group"
                  onChange={handleChange}
                  value={values.group}
                  getOptionLabel={(option) => option}
                  options={["Group 1","Group 2","Group 3"]}
                  loading={groupLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Groups"
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <React.Fragment>
                            {groupLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </React.Fragment>
                        ),
                      }}
                    />
                  )}
                />
                }
                <TextField
                  fullWidth
                  variant="outlined"
                  type="subject"
                  placeholder="Subject"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  value={values.subject}
                  name="subject"
                  error={!!touched.subject && !!errors.subject}
                  helperText={touched.subject && errors.subject}
                  sx={{ gridColumn: "span 4" }}
                />
                <TextField
                    id="datetime-local"
                    label="Scheduled Date"
                    type="datetime-local"
                    sx={{ gridColumn: "span 4" }}
                    onChange={handleDateChange}
                    value={date}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <Stack
                  spacing={1}
                  sx={{ gridColumn: "span 4", minHeight: 200, border:"2px solid #f5f5f5", borderRadius:"4px",padding:"10px 10px" }}
                  direction="row"
                >
                  {/* <MUIRichTextEditor 
                      label="Type something here..."
                      onSave={save}
                      inlineToolbar={true}
                    /> */}
                    <TextField
                  fullWidth
                  multiline
                  value={values.body}
                  onBlur={handleBlur}
                  onChange={handleChange}
                  variant="outlined"
                  type="body"
                  placeholder="Body"
                  name="body"
                  error={!!touched.body && !!errors.body}
                  helperText={touched.body && errors.body}
                  sx={{ gridColumn: "span 4" }}
                />
                <div
      dangerouslySetInnerHTML={{__html: values.body}}
    />
                    </Stack>
                <FormControlLabel control={<Checkbox />} label="Generate for group" onChange={handleGroupGenerate} value={groupGenerate} sx={{ gridColumn: "span 4" }}/>
              </Box>
              <Box display="flex" justifyContent="end" mt="20px">
                <LoadingButton
                  type="submit"
                  color="primary"
                  variant="contained"
                  loading={loading}
                  loadingPosition="end"
                  sx={{
                    fontWeight: "bolder",
                    textTransform: "none !important",
                    marginBottom: "5px",
                    width: "143px",
                  }}
                  size="large"
                >
                  Generate Mail
                </LoadingButton>
              </Box>
              <Box
                display={"flex"}
                justifyContent="center"
                alignItems={"center"}
                margin={"5vh 0vh"}
              >
                <Typography
                  variant="h5"
                  sx={{
                    padding: "0px 5px",
                  }}
                >
                  View mail status ?
                </Typography>
                <Typography
                  fontWeight="bolder"
                  variant="h5"
                  color={"#696cff"}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    "&:hover": {
                      textDecoration: "underline",
                    },
                  }}
                >
                  View
                  <LaunchIcon
                    sx={{
                      margin: "0px 5px",
                    }}
                  />
                </Typography>
              </Box>
            </form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default GenerateMail;
