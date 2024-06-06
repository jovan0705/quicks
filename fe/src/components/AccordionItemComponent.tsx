import {Box,   Icon,
    Image,
    Text,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverHeader,
    PopoverBody,
    PopoverFooter,
    PopoverArrow,
    PopoverCloseButton,
    PopoverAnchor,
    Input,
    InputGroup,
    InputRightElement,
    Button,
    Divider,
    AbsoluteCenter,
    Tag,
    Select,
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
    Checkbox,
    Textarea,} from "@chakra-ui/react"
    import moment from "moment";
    import { HiOutlineDotsHorizontal } from "react-icons/hi";
    import logoClock from "../assets/logoClock.png";
import logoDescription from "../assets/logoDescription.png";
import axios from "axios"
import "../pages/style.css"

const AccordionItemComponent = ({taskList, category, taskDoneFlag, setTaskDoneFlag, taskDescriptionEditFlag, setTaskDescriptionEditFlag, tempEditDesc, setTempEditDesc, taskSelectShow, setTaskSelectShow, taskDescriptionSticker, handleFetchTask, setTaskDescriptionSticker}) => {
    const handleUpdateTags = async (payload: any) => {
        console.log(payload, 'ini payload')
        const status = payload.status ? "done" : "not done";
        await axios.put(
          `https://dummyapi.io/data/v1/post/${payload.id}`,
          {
            tags: [payload.category, payload.date, payload.description, status, payload.stickers],
          },
          {
            headers: {
              "app-id": "665d8e08d37de2baac24e773",
            },
          }
        );
        handleFetchTask();
      };
    const handleDeleteTask = async (id: string) => {
        const resp = await axios.delete(
          `https://dummyapi.io/data/v1/post/${id}`,
          {
            headers: {
              "app-id": "665d8e08d37de2baac24e773",
            },
          }
        );
        handleFetchTask();
      }
    const handleChangeSticker = (category: number, index:number, value:any) => {
        let tempStickerArr:any = []
        taskDescriptionSticker[category].forEach((el: any, idx: number) => {
          if (idx === index) {
            let tempSticker:any = taskDescriptionSticker[category][index]
            if (tempSticker.some((le: any) => le.label === value.label)) {
              tempSticker = tempSticker.filter((li: any) => li.label !== value.label)
            } else {
              tempSticker.push(value)
            }
            tempStickerArr.push(tempSticker)
          } else {
            tempStickerArr.push(el)
          }
        })
    
        if (category === 0) {
          setTaskDescriptionSticker([tempStickerArr, taskDescriptionSticker[1], taskDescriptionSticker[2]])
        } else if (category === 1) {
          setTaskDescriptionSticker([taskDescriptionSticker[0], tempStickerArr, taskDescriptionSticker[2]])
        } else if (category === 2) {
          setTaskDescriptionSticker([taskDescriptionSticker[0], taskDescriptionSticker[1], tempStickerArr])
        }
      }
    const handleSubmitSticker = async (id, tags) => {
        await axios.put(
          `https://dummyapi.io/data/v1/post/${id}`,
          {
            tags,
          },
          {
            headers: {
              "app-id": "665d8e08d37de2baac24e773",
            },
          }
        );
    
        handleFetchTask();
      }

      const handleUpdateName = async (payload: any) => {
        await axios.put(
          `https://dummyapi.io/data/v1/post/${payload.id}`,
          {
            text: payload.text,
          },
          {
            headers: {
              "app-id": "665d8e08d37de2baac24e773",
            },
          }
        );
        handleFetchTask();
      };
    const options = [
        { label: "Important ASAP", value: "Important ASAP", color: "#E5F1FF" },
        { label: "Offline Meeting", value: "Offline Meeting", color: "#FDCFA4" },
        { label: "Virtual Meeting", value: "Virtual Meeting", color: "#F9E9C3" },
        { label: "ASAP", value: "ASAP", color: "#AFEBDB" },
        { label: "Client Related", value: "Client Related", color: "#CBF1C2" },
        { label: "Self Task", value: "Self Task", color: "#CFCEF9" },
        { label: "Appointments", value: "Appointments", color: "#F9E0FD" },
        { label: "Court Related", value: "Court Related", color: "#9DD0ED" },
      ];
    return (<Box>
        {taskList[category].map((el: any, idx: number) => (
              <AccordionItem key={el.id} position={"relative"}>
                <Box display={"flex"}>
                  <AccordionButton alignItems={"start"} pr={"0.5rem"}>
                    <Box display={"flex"} w={"60%"} alignItems={"start"}>
                      <Checkbox
                        isChecked={taskDoneFlag[category][idx]}
                        mr={"16px"}
                        mt={"4px"}
                        onChange={(e) => {
                          const tempCheck: any = [];
                          taskDoneFlag[category].forEach((el: any, index:number) => {
                            if (index !== idx) {
                              tempCheck.push(el);
                            } else {
                              tempCheck.push(e.target.checked);
                            }
                          });
                          setTaskDoneFlag([tempCheck, taskDoneFlag[1], taskDoneFlag[2]]);
                        handleUpdateTags({ ...el, status: e.target.checked, stickers: el.stickers }); 
                        }}
                      ></Checkbox>
                      <Text
                        fontSize={"14px"}
                        display={category !== 2 ? "flex" : "none"}
                        fontWeight={"semibold"}
                        color={taskDoneFlag[category][idx] ? "#828282" : "#4F4F4F"}
                        textAlign={"left"}
                        textDecor={taskDoneFlag[category][idx] && "line-through"}
                      >
                        {el.name}
                      </Text>
                      <Input
                        size={"xs"}
                        display={category === 2 ? "flex" : "none"}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            handleUpdateName({
                              id: el.id,
                              text: e.currentTarget.value,
                            });
                          }
                        }}
                      />
                    </Box>
                    <Box
                      w={"40%"}
                      display={"flex"}
                      alignItems={"start"}
                      justifyContent={"flex-end"}
                    >
                      <Text
                        display={
                          (!taskDoneFlag[category][idx] && el.date && new Date(el.date) > new Date())
                            ? "flex"
                            : "none"
                        }
                        fontSize={"12px"}
                        color={"#EB5757"}
                        mr={"10px"}
                      >
                        {moment(el.date, "MM/DD/YYYY").fromNow().split(" ")[1]}{" "}
                        {moment(el.date, "MM/DD/YYYY").fromNow().split(" ")[2]}{" "}
                        left
                      </Text>
                      <Text
                        display={el.date ? "flex" : "none"}
                        fontSize={"11px"}
                        color={"#4F4F4F"}
                        mr={"8px"}
                      >
                        {moment(el.date).format("DD/MM/YYYY")}
                      </Text>
                      <AccordionIcon height={"14px"} />
                    </Box>
                  </AccordionButton>
                  <Popover placement="bottom" closeOnBlur={true}>
                    <PopoverTrigger>
                      <Box h={"20px"}>
                        <Icon
                          as={HiOutlineDotsHorizontal}
                          mr={"24px"}
                          mt={"0.5rem"}
                          height={"14px"}
                        />
                      </Box>
                    </PopoverTrigger>
                    <PopoverContent
                      display={"flex"}
                      flexDir={"column"}
                      borderRadius={"4px"}
                      border={"1px solid #bdbdbd"}
                      width={"100px"}
                    >
                      <Box
                        px={"12px"}
                        py={"6px"}
                        _hover={{ cursor: "pointer" }}
                        onClick={() => {handleDeleteTask(el.id)}}
                      >
                        <Text color={"#eb5757"} fontSize={"12px"}>
                          Delete
                        </Text>
                      </Box>
                    </PopoverContent>
                  </Popover>
                </Box>
                <AccordionPanel pb={4} flexDir={"column"} pl={"40px"}>
                  <Box
                    display={"flex"}
                    w={"100%"}
                    alignItems={"center"}
                    mb={"12px"}
                    ml={"6px"}
                  >
                    <Image
                      src={logoClock.src}
                      height={"16px"}
                      width={"16px"}
                      mr={"12px"}
                      alt="dateLogo"
                    />
                    <Input
                      placeholder="Select Date"
                      size="sm"
                      type="date"
                      width={"120px"}
                      value={moment(el.date).format("YYYY-MM-DD")}
                      onChange={(e) => {
                        handleUpdateTags({
                          ...el,
                          status: taskDoneFlag[category][idx],
                          date: moment(e.target.value).format("MM/DD/YYYY"),
                          stickers: el.stickers
                        });
                      }}
                    />
                  </Box>
                  <Box
                    display={"flex"}
                    w={"100%"}
                    alignItems={"start"}
                    pr={"46px"}
                    mb={"8px"}
                    ml={"6px"}
                  >
                    <Image
                      src={logoDescription.src}
                      height={"14px"}
                      width={"14px"}
                      mr={"12px"}
                      mt={"4px"}
                      alt="editLogo"
                      onClick={() => {
                        const temp: any = [];
                        taskDescriptionEditFlag[category].forEach((el: any, index: number) => {
                          if (idx !== index) {
                            temp.push(el);
                          } else {
                            temp.push(!el);
                          }
                        });
                        setTaskDescriptionEditFlag([
                          temp,
                          taskDescriptionEditFlag[1],
                          taskDescriptionEditFlag[2],
                        ]);
                        if (taskDescriptionEditFlag[category][idx]) {
                          handleUpdateTags({
                            ...el,
                            status: taskDoneFlag[category][idx],
                            description: tempEditDesc,
                            stickers: el.stickers
                          });
                        }
                      }}
                    />
                    <Text
                      fontSize={"12px"}
                      display={
                        !taskDescriptionEditFlag[category][idx] ? "initial" : "none"
                      }
                    >
                      {el.description ? el.description : "No Description"}
                    </Text>
                    <Textarea
                      display={
                        taskDescriptionEditFlag[category][idx] ? "initial" : "none"
                      }
                      defaultValue={el.description}
                      size={"xs"}
                      onChange={(e) => {
                        setTempEditDesc(e.target.value);
                      }}
                    ></Textarea>
                  </Box>
                  <Box
                    display={"flex"}
                    w={"100%"}
                    alignItems={"center"} bgColor={"#F9F9F9"}
                    borderRadius={"4px"}
                    height={"32px"}
                    pl={"6px"}
                    _hover={{cursor: "pointer"}}
                    onClick={() => {
                      const isShow = !taskSelectShow[category][idx]
                      const tempShow: any = [];
                            taskSelectShow[category].forEach((li: any, index: number) => {
                              if (index !== idx) {
                                tempShow.push(li);
                              } else {
                                tempShow.push(!li);
                              }
                            });
                            setTaskSelectShow([tempShow, taskSelectShow[1], taskSelectShow[2]]);
                      if (!isShow) {
                        const tags = [
                          el.category,
                          el.date,
                          el.description,
                          taskDoneFlag[category][idx] ? "done": "not done",
                          JSON.stringify(taskDescriptionSticker[category][idx])
                        ]
                        // const tags = [...el.tags]
                        handleSubmitSticker(el.id, tags)
                      } }
                      }
                  >
                    <Image
                      src={logoClock.src}
                      height={"16px"}
                      width={"16px"}
                      mr={"12px"}
                      alt="dateLogo"
                    />
                    {(taskDescriptionSticker[category].length > 0 &&taskDescriptionSticker[category][idx].length > 0) &&
                    taskDescriptionSticker[category][idx].map((il: any, index: number) => <Box key={index} bgColor={il.color} borderRadius={"4px"} py={"4px"} px={"8px"} mr={"4px"}>
                      <Text fontSize={"12px"} color={"#4F4F4F"} fontWeight={"semibold"}>{il.label}</Text>
                    </Box>)
                    }
                  </Box>
                  <Box ml={"8px"} display={taskSelectShow[category][idx] ? "flex" : "none"} position={"absolute"} width={"250px"} borderRadius={"4px"} flexDir={"column"} border={"2px solid #828282"} bgColor={"white"} zIndex={1} px={"12px"} py={"8px"} >
                    {options.map((le) => <Box my={"4px"} key={le.value} _hover={{cursor: "pointer"}} bgColor={le.color} py={"4px"} px={"12px"} borderRadius={"4px"} onClick={() => {
                    handleChangeSticker(0, idx, le)
                  }}>
                      <Text color={"#4F4F4F"} fontSize={"10px"} fontWeight={"semibold"}>{le.label}</Text>
                    </Box>)}
                  </Box>
                </AccordionPanel>
              </AccordionItem>
            ))}
    </Box>)
}

export default AccordionItemComponent