import {
  Box,
  Icon,
  Image,
  Text,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Divider,
  AbsoluteCenter,
  Tag,
  Select,
  Accordion,
} from "@chakra-ui/react";
import React from "react";
import "./style.css";
import { IoSearchSharp, IoArrowBack, IoClose } from "react-icons/io5";
import { useAppSelector, useAppStore } from "../lib/hooks";
import { setChatsState } from "../lib/features/chat/chatSlice";
import { setTasksState } from "@/lib/features/task/taskSlice";
import logoPopup from "../assets/logoSticky.png";
import logoTask from "../assets/logoTask.png";
import logoInbox from "../assets/logoInbox.png";
import logoTaskSelected from "../assets/logoTaskSelected.png";
import logoInboxSelected from "../assets/logoInboxSelected.png";
import logoPerson from "../assets/logoPerson.png";
import logoPersonWhite from "../assets/logoPersonWhite.png";
import closeIcon from "../assets/closeIcon.png"
import axios from "axios";
import moment from "moment";
import { color, textColor } from "../assets/colorScheme";
import { HiOutlineDotsHorizontal } from "react-icons/hi";
import ReactLoading from "react-loading";
import AccordionItemComponent from "@/components/AccordionItemComponent";

export default function Home() {
  const [showPopover, setShowPopover] = React.useState(false);
  const [selectedPopover, setSelectedPopover] = React.useState("");
  const [inboxChat, setInboxChat] = React.useState(false);
  const [selectedChat, setSelectedChat] = React.useState<any>({});
  const [taskDetail, setTaskDetail] = React.useState(false);
  const store = useAppStore();
  const [reachBotom, setReachBottom] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const chats = useAppSelector((state) => state.chat.chats);
  const tasks = useAppSelector((state) => state.task.tasks);
  const [taskFilter, setTaskFilter] = React.useState("My Tasks");
  const [taskDoneFlag, setTaskDoneFlag] = React.useState([[], [], []]);
  const [taskDescriptionEditFlag, setTaskDescriptionEditFlag] = React.useState([
    [],
    [],
    [],
  ]);
  const [taskDescriptionSticker, setTaskDescriptionSticker] =
    React.useState<any>([[], [], []]);
  const [taskSelectShow, setTaskSelectShow] = React.useState([[], [], []]);
  const [tempEditDesc, setTempEditDesc] = React.useState("");
  const [chatReply, setChatReply] = React.useState("");
  const [repliedChat, setRepliedChat] = React.useState<any>({});

  React.useEffect(() => {
    if (selectedPopover === "inbox") {
      handleFetchInbox();
    } else if (selectedPopover === "task") {
      handleFetchTask();
    }
  }, [selectedPopover]);

  const chatList = React.useMemo(() => {
    if (search) {
      const tempInboxChat: any = [];
      chats.forEach((el: any) => {
        if (search) {
          if (el.text.toLowerCase().includes(search.toLowerCase())) {
            tempInboxChat.push(el);
          }
        } else {
          tempInboxChat.push(el);
        }
      });
      return tempInboxChat;
    } else {
      return chats;
    }
  }, [chats, search]);

  const compareDate = (a: any, b: any) => {
    const dateA = new Date(a.tags[1]);
    const dateB = new Date(b.tags[1]);
    // @ts-ignore
    return dateA - dateB;
  };

  const taskList = React.useMemo(() => {
    const done: any = [];
    const notDone: any = [];
    const newTaskNotDone: any = [];
    const tempNotDoneFlag: any = [];
    const tempDoneFlag: any = [];
    const tempNewFlag: any = [];
    const tempEditDescriptionFlag: any = [[], [], []];
    const tempSelectShowFlag: any = [[], [], []];
    let filteredTask: any = [];
    const tempDescriptionSticker: any = [[], [], []];
    if (taskFilter !== "My Tasks") {
      tasks.forEach((el: any) => {
        if (el.tags[0] === taskFilter) filteredTask.push(el);
      });
    } else {
      filteredTask = [...tasks];
    }

    filteredTask.sort(compareDate).forEach((el: any) => {
      let props = {
        id: el.id,
        name: el.text,
        category: el.tags[0],
        date: el.tags[1],
        description: el.tags[2],
        stickers: el.tags[4] || [],
      };

      if (el.tags[3] === "not done" && el.text) {
        tempNotDoneFlag.push(false);
        notDone.push(props);
        tempEditDescriptionFlag[0].push(false);
        tempSelectShowFlag[0].push(false);
        if (el.tags[4] && JSON.parse(el.tags[4]).length > 0) {
          tempDescriptionSticker[0].push(JSON.parse(el.tags[4]));
        } else {
          tempDescriptionSticker[0].push([]);
        }
      } else if (el.tags[3] === "not done" && !el.text) {
        tempNewFlag.push(false);
        newTaskNotDone.push(props);
        tempEditDescriptionFlag[2].push(false);
        tempSelectShowFlag[2].push(false);
        if (el.tags[4] && el.tags[4].length > 0) {
          tempDescriptionSticker[2].push(JSON.parse(el.tags[4]));
        } else {
          tempDescriptionSticker[2].push([]);
        }
      } else {
        tempDoneFlag.push(true);
        done.push(props);
        tempEditDescriptionFlag[1].push(false);
        tempSelectShowFlag[1].push(false);
        if (el.tags[4] && el.tags[4].length > 0) {
          tempDescriptionSticker[1].push(JSON.parse(el.tags[4]));
        } else {
          tempDescriptionSticker[1].push([]);
        }
      }
    });
    setTaskDoneFlag([tempNotDoneFlag, tempDoneFlag, tempNewFlag]);
    setTaskDescriptionEditFlag(tempEditDescriptionFlag);
    setTaskSelectShow(tempSelectShowFlag);
    setTaskDescriptionSticker(tempDescriptionSticker);
    return [notDone, done, newTaskNotDone];
  }, [tasks, taskFilter]);

  const messageByDate = React.useMemo(() => {
    const groupedMessages: any = {};

    if (Object.keys(selectedChat).length > 0) {
      selectedChat.messages.forEach((message: any) => {
        const publishDate = new Date(message.publishDate)
          .toISOString()
          .split("T")[0]; // Extract YYYY-MM-DD
        if (!groupedMessages[publishDate]) {
          groupedMessages[publishDate] = [];
        }
        groupedMessages[publishDate].push(message);
      });
    }
    return Object.entries(groupedMessages) || [];
  }, [selectedChat]);

  const handleFetchInbox = () => {
    axios
      .get("https://dummyapi.io/data/v1/user/665d94824fd179295d788f7d/post", {
        headers: { "app-id": "665d8e08d37de2baac24e773" },
      })
      .then(async (resp) => {
        const result = await Promise.all(
          resp.data.data.map(async (el: any) => {
            const { data } = await axios.get(
              `https://dummyapi.io/data/v1/post/${el.id}/comment`,
              {
                headers: { "app-id": "665d8e08d37de2baac24e773" },
              }
            );
            const uniqueParticipant = Array.from(
              new Set(data.data.map((el: { owner: any }) => el.owner))
            ).filter((el: any) => el.id !== "665d94824fd179295d788f7d");

            const distinctValues = new Set();
            let distinctObjects: any = [];
            uniqueParticipant.forEach((obj: any) => {
              const key = obj.firstName + obj.lastName;
              if (!distinctValues.has(key)) {
                distinctValues.add(key);
                distinctObjects.push(obj);
              }
            });

            distinctObjects = distinctObjects.map((el: any, idx: number) => {
              return {
                ...el,
                color: color[idx + 1],
                textColor: textColor[idx + 1],
              };
            });

            const transformedData: any = {};

            distinctObjects.forEach((obj: any) => {
              transformedData[obj.id] = {
                color: obj.color,
                textColor: obj.textColor,
              };
            });

            transformedData["665d94824fd179295d788f7d"] = {
              color: color[0],
              textColor: textColor[0],
            };

            return {
              ...el,
              messages: data.data.reverse(),
              participant: distinctObjects,
              participantColor: transformedData,
            };
          })
        );
        store.dispatch(setChatsState(result));
      });
  };

  const handleFetchTask = () => {
    axios
      .get("https://dummyapi.io/data/v1/user/665feb7e5d913b69db6c63c8/post", {
        headers: { "app-id": "665d8e08d37de2baac24e773" },
      })
      .then(async (resp) => {
        store.dispatch(setTasksState(resp.data.data));
      });
  };

  const handleReply = (chat: string) => {
    setRepliedChat(chat)
  };

  const handleSendChat = async (payload: any) => {
    const resp = await axios
      .post(`https://dummyapi.io/data/v1/comment/create`, {
        owner: "665d94824fd179295d788f7d",
        post: payload.id,
        message: payload.message
      }, {
        headers: { "app-id": "665d8e08d37de2baac24e773" },
      })
    handleSelectChat({...selectedChat, messages: [...selectedChat.messages, resp.data]});
  }

  const handleDeleteChat = async (id: string) => {
    const resp = await axios
      .delete(`https://dummyapi.io/data/v1/comment/${id}`, {
        headers: { "app-id": "665d8e08d37de2baac24e773" },
      })
    handleFetchInbox();
    const remainingData = await selectedChat.messages.filter((el: any) => el.id !== resp.data.id)
    handleSelectChat({...selectedChat, messages: remainingData});
  };

  const handleNewTaskButton = async () => {
    const data = {
      owner: "665feb7e5d913b69db6c63c8",
      text: "",
      tags: ["Personal Errands", "", "", "not done"],
    };
    const resp = await axios.post(
      "https://dummyapi.io/data/v1/post/create",
      data,
      {
        headers: { "app-id": "665d8e08d37de2baac24e773" },
      }
    );
    handleFetchTask();
  };

  const handleSelectPopover = (value: string) => {
    setInboxChat(false);
    setReachBottom(false);
    setSearch("");
    if (value === selectedPopover) {
      setSelectedPopover("");
    } else {
      setSelectedPopover(value);
    }
  };

  const handleSelectChat = (chat: any) => {
    if (chat.messages.length < 4) setReachBottom(true);
    setInboxChat(true);
    setSelectedChat(chat);
    setChatReply("");
    setRepliedChat({});
  };

  // #4f4f4f
  return (
    <Box backgroundColor={"#333333"} h={"100vh"} w={"100vw"} display={"flex"}>
      <Box h={"100%"} w={"15vw"} borderRight={"1px solid white"}></Box>
      <Box h={"100%"} w={"85vw"} display={"flex"} flexDir={"column"}>
        <Box
          display={"flex"}
          backgroundColor={"#4f4f4f"}
          w={"100%"}
          height={"42px"}
          alignItems={"center"}
          px={"20px"}
        >
          <Icon as={IoSearchSharp} color={"white"} />
        </Box>
      </Box>
      <Box
        className={
          selectedPopover === "task"
            ? "popoverBoxTask selected"
            : selectedPopover === "inbox"
            ? "popoverBoxTask inbox"
            : "popoverBoxTask"
        }
      >
        <Box
          className={showPopover ? "popoverMenu show" : "popoverMenu"}
          onClick={() => handleSelectPopover("task")}
        >
          <Text
            className={
              selectedPopover !== "" ? "popoverText" : "popoverText show"
            }
          >
            Task
          </Text>
          <Box
            className={
              selectedPopover === "task" ? "selectedPopoverTask" : "popoverTask"
            }
          >
            <Image
              src={logoTask.src}
              w={"20px"}
              h={"15px"}
              display={selectedPopover === "task" ? "none" : "block"}
              alt="logoTask"
            />
            <Image
              src={logoTaskSelected.src}
              w={"20px"}
              h={"15px"}
              display={selectedPopover === "task" ? "block" : "none"}
              alt="logoTask"
            />
          </Box>
        </Box>
      </Box>
      <Box
        className={
          selectedPopover === "inbox"
            ? "popoverBoxInbox selected"
            : "popoverBoxInbox"
        }
      >
        <Box
          className={showPopover ? "popoverMenu show" : "popoverMenu"}
          onClick={() => handleSelectPopover("inbox")}
        >
          <Text
            className={
              selectedPopover !== "" ? "popoverText" : "popoverText show"
            }
          >
            Inbox
          </Text>
          <Box
            className={
              selectedPopover === "inbox"
                ? "selectedPopoverInbox"
                : "popoverInbox"
            }
          >
            <Image
              src={logoInbox.src}
              w={"15px"}
              h={"15px"}
              display={selectedPopover === "inbox" ? "none" : "block"}
              alt="logoInbox"
            />
            <Image
              src={logoInboxSelected.src}
              w={"15px"}
              h={"15px"}
              display={selectedPopover === "inbox" ? "block" : "none"}
              alt="logoInbox"
            />
          </Box>
        </Box>
      </Box>
      <Box
        position={"absolute"}
        bottom={"24px"}
        right={"24px"}
        alignItems={"flex-end"}
      >
        <Box
          className={selectedPopover === "" ? "quickMenu" : "quickMenu hide"}
          onClick={() => {
            setShowPopover(!showPopover);
          }}
        >
          <Image
            src={logoPopup.src}
            w={"10px"}
            h={"20px"}
            alt="quickMenuLogo"
          />
        </Box>
      </Box>

      <Box className={selectedPopover === "task" ? "taskBox show" : "taskBox"}>
        <Box width={"100%"} height={"50px"} display={"flex"}>
          <Box width={"50%"} pl={"80px"} py={"12px"}>
            <Select
              width={"70%"}
              size={"sm"}
              value={taskFilter}
              onChange={(e) => {
                setTaskFilter(e.target.value);
              }}
            >
              <option value="My Tasks">My Tasks</option>
              <option value="Personal Errands">Personal Errands</option>
              <option value="Urgent To-Do">Urgent To-Do</option>
            </Select>
          </Box>
          <Box
            width={"50%"}
            display={"flex"}
            justifyContent={"flex-end"}
            pt={"12px"}
            pr={"24px"}
            pb={"8px"}
          >
            <Box
              backgroundColor={"#2F80ED"}
              py={"4px"}
              px={"12px"}
              borderRadius={"4px"}
              _hover={{ cursor: "pointer" }}
              onClick={() => handleNewTaskButton()}
            >
              <Text fontSize={"14px"} color={"white"} fontWeight={"semibold"}>
                New Task
              </Text>
            </Box>
          </Box>
        </Box>
        {tasks.length === 0 && (
          <Box
            display={"flex"}
            flexDir={"column"}
            alignItems={"center"}
            justifyContent={"center"}
            height={"400px"}
          >
            <ReactLoading
              type={"spin"}
              color={"grey"}
              height={"40px"}
              width={"40px"}
            />
            <Text fontSize={"14px"}>Loading Task List...</Text>
          </Box>
        )}
        <Box width={"100%"} display={"flex"} overflowY={"scroll"}>
          <Accordion
            defaultIndex={[0, 1, 2]}
            allowMultiple
            w={"100%"}
            display={taskList.length > 0 ? "flex" : "none"}
            flexDir={"column"}
          >
            <AccordionItemComponent
              taskList={taskList}
              category={0}
              taskDoneFlag={taskDoneFlag}
              setTaskDoneFlag={setTaskDoneFlag}
              taskDescriptionEditFlag={taskDescriptionEditFlag}
              setTaskDescriptionEditFlag={setTaskDescriptionEditFlag}
              tempEditDesc={tempEditDesc}
              setTempEditDesc={setTempEditDesc}
              taskSelectShow={taskSelectShow}
              setTaskSelectShow={setTaskSelectShow}
              taskDescriptionSticker={taskDescriptionSticker}
              handleFetchTask={handleFetchTask}
              setTaskDescriptionSticker={setTaskDescriptionSticker}
            />
            <AccordionItemComponent
              taskList={taskList}
              category={1}
              taskDoneFlag={taskDoneFlag}
              setTaskDoneFlag={setTaskDoneFlag}
              taskDescriptionEditFlag={taskDescriptionEditFlag}
              setTaskDescriptionEditFlag={setTaskDescriptionEditFlag}
              tempEditDesc={tempEditDesc}
              setTempEditDesc={setTempEditDesc}
              taskSelectShow={taskSelectShow}
              setTaskSelectShow={setTaskSelectShow}
              taskDescriptionSticker={taskDescriptionSticker}
              handleFetchTask={handleFetchTask}setTaskDescriptionSticker={setTaskDescriptionSticker}
            />
            <AccordionItemComponent
              taskList={taskList}
              category={2}
              taskDoneFlag={taskDoneFlag}
              setTaskDoneFlag={setTaskDoneFlag}
              taskDescriptionEditFlag={taskDescriptionEditFlag}
              setTaskDescriptionEditFlag={setTaskDescriptionEditFlag}
              tempEditDesc={tempEditDesc}
              setTempEditDesc={setTempEditDesc}
              taskSelectShow={taskSelectShow}
              setTaskSelectShow={setTaskSelectShow}
              taskDescriptionSticker={taskDescriptionSticker}
              handleFetchTask={handleFetchTask}setTaskDescriptionSticker={setTaskDescriptionSticker}
            />
          </Accordion>
        </Box>
      </Box>

      <Box
        className={selectedPopover === "inbox" ? "inboxBox show" : "inboxBox"}
      >
        <Box
          className={
            selectedPopover === "inbox" && !inboxChat
              ? "inboxChats show"
              : "inboxChats"
          }
        >
          <InputGroup>
            <InputRightElement pointerEvents="none" pr={"40px"}>
              <Icon as={IoSearchSharp}></Icon>
            </InputRightElement>
            <Input
              pl={"40px"}
              pr={"54px"}
              placeholder="Search"
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              value={search}
            />
          </InputGroup>
          {chatList.length === 0 && (
            <Box
              display={"flex"}
              flexDir={"column"}
              alignItems={"center"}
              justifyContent={"center"}
              height={"400px"}
            >
              <ReactLoading
                type={"spin"}
                color={"grey"}
                height={"40px"}
                width={"40px"}
              />
              <Text fontSize={"14px"}>Loading Chats...</Text>
            </Box>
          )}
          {chatList.map((el: any, idx: number) => {
            return (
              <Box
                key={el.id}
                _hover={{ cursor: "pointer" }}
                onClick={() => {
                  handleSelectChat(el);
                }}
              >
                {el.messages.length > 0 && (
                  <Box
                    w={"100%"}
                    display={"flex"}
                    alignItems={"center"}
                    py={"20px"}
                    borderBottom={
                      idx !== chats.length - 1 ? "1px solid #e0e0e0" : ""
                    }
                  >
                    <Box
                      w={"50px"}
                      display={"flex"}
                      alignItems={"center"}
                      justifyContent={"center"}
                      mr={"10px"}
                    >
                      {el.participant.length > 1 ? (
                        <Box display={"flex"}>
                          <Box
                            w={"30px"}
                            h={"30px"}
                            borderRadius={"50%"}
                            backgroundColor={"#e0e0e0"}
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={"center"}
                            mr={"-14px"}
                          >
                            <Image
                              src={logoPerson.src}
                              w={"12px"}
                              h={"12px"}
                              alt="logoPerson"
                            />
                          </Box>
                          <Box
                            w={"30px"}
                            h={"30px"}
                            borderRadius={"50%"}
                            backgroundColor={"#2f80ed"}
                            display={"flex"}
                            alignItems={"center"}
                            justifyContent={"center"}
                          >
                            <Image
                              src={logoPersonWhite.src}
                              w={"12px"}
                              h={"12px"}
                              alt="logoPersonWhite"
                            />
                          </Box>
                        </Box>
                      ) : (
                        <Box
                          w={"30px"}
                          h={"30px"}
                          borderRadius={"50%"}
                          backgroundColor={"#2f80ed"}
                          display={"flex"}
                          alignItems={"center"}
                          justifyContent={"center"}
                        >
                          <Text color={"white"}>
                            {el.participant[0].firstName[0]}
                          </Text>
                        </Box>
                      )}
                    </Box>
                    <Box display={"flex"} flexDir={"column"}>
                      <Box display={"flex"} alignItems={"flex-end"}>
                        <Text
                          color={"#2f80ed"}
                          fontWeight={"semibold"}
                          mr={"12px"}
                          fontSize={"14px"}
                        >
                          {el.text}
                        </Text>
                        <Text fontSize={"12px"}>
                          {idx === 0
                            ? moment(
                                el.messages[el.messages.length - 1].publishDate
                              ).format("MMMM D, YYYY HH:mm")
                            : moment(
                                el.messages[el.messages.length - 1].publishDate
                              ).format("DD/MM/YYYY HH:mm")}
                        </Text>
                      </Box>
                      <Text
                        fontSize={"12px"}
                        fontWeight={"semibold"}
                        color={"#4f4f4f"}
                        display={el.participant.length > 1 ? "initial" : "none"}
                      >
                        {el.messages[el.messages.length - 1].owner.firstName}{" "}
                        {el.messages[el.messages.length - 1].owner.lastName}
                      </Text>
                      <Text fontSize={"12px"} color={"#4f4f4f"}>
                        {el.messages[el.messages.length - 1].message.split("---")[0].length > 68
                          ? `${el.messages[
                              el.messages.length - 1
                            ].message.split("---")[0].slice(0, 68)}...`
                          : el.messages[el.messages.length - 1].message.split("---")[0]}
                      </Text>
                    </Box>
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>
        <Box
          className={
            selectedPopover === "inbox" && !inboxChat
              ? "inboxChatbox"
              : "inboxChatbox show"
          }
        >
          <Box
            display={"flex"}
            w={"100%"}
            borderBottom={"1px solid #e0e0e0"}
            px={"24px"}
            py={"16px"}
            alignItems={"center"}
            height={"70px"}
            mb={"5px"}
          >
            <Icon
              as={IoArrowBack}
              onClick={() => {
                setInboxChat(false);
                setSearch("");
                setTimeout(() => setReachBottom(false), 500);
              }}
              mr={"12px"}
              _hover={{ cursor: "pointer" }}
            />
            <Box display={"flex"} flexDir={"column"} width={"90%"}>
              <Text
                color={"#2f80ed"}
                fontWeight={"semibold"}
                mr={"12px"}
                fontSize={"14px"}
              >
                {selectedChat.text}
              </Text>
              <Text fontSize={"12px"}>
                {Object.keys(selectedChat).length &&
                  selectedChat.participant.length + 1}{" "}
                Participants
              </Text>
            </Box>
            <Icon
              as={IoClose}
              onClick={() => {
                setSelectedPopover("");
                setInboxChat(false);
                setSearch("");
                setTimeout(() => setReachBottom(false), 500);
              }}
              right={0}
              w={"5%"}
              _hover={{ cursor: "pointer" }}
            />
          </Box>
          <Box
            w={"99%"}
            height={"365px"}
            overflowY={"scroll"}
            px={"24px"}
            py={"12px"}
            onScroll={(e) => {
              const scrolledTo = e.currentTarget.scrollTop;
              const threshold = 470;
              const isReachBottom =
                scrolledTo + threshold > e.currentTarget.scrollHeight;
              if (isReachBottom && !reachBotom) setReachBottom(isReachBottom);
            }}
          >
            {messageByDate.length > 0 &&
              messageByDate.map((el: any, idx: number) => {
                return (
                  <Box key={`${idx}-date`}>
                    <Box position="relative" py={"12px"}>
                      <Divider borderColor="#4f4f4f" />
                      <AbsoluteCenter
                        bg="white"
                        px="4"
                        fontSize={"14px"}
                        fontWeight={"semibold"}
                        color={"#4f4f4f"}
                      >
                        {`${moment(el[0]).calendar().split(" ")[0]} `}
                        {moment(el[0]).format("MMMM DD, YYYY")}
                      </AbsoluteCenter>
                    </Box>
                    {el[1].map((le: any, idx: number) => (
                      <Box key={le.id}>
                        {((messageByDate.length > 1 && idx === messageByDate.length-1) || messageByDate.length === 1) && idx === el[1].length - 1 &&
                          le.owner.id !== "665d94824fd179295d788f7d" && (
                            <Box position="relative" py={"12px"}>
                              <Divider borderColor="#EB5757" />
                              <AbsoluteCenter
                                bg="white"
                                px="4"
                                fontSize={"14px"}
                                fontWeight={"semibold"}
                                color={"#EB5757"}
                              >
                                New Message
                              </AbsoluteCenter>
                            </Box>
                          )}
                        <Box
                          display={"flex"}
                          flexDir={"column"}
                          alignItems={
                            le.owner.id === "665d94824fd179295d788f7d"
                              ? "flex-end"
                              : "flex-start"
                          }
                        >
                          <Text
                            fontWeight="semibold"
                            display={
                              le.owner.id === "665d94824fd179295d788f7d"
                                ? "none"
                                : "initial"
                            }
                            color={
                              selectedChat.participantColor[le.owner.id]
                                .textColor
                            }
                            fontSize={"12px"}
                          >
                            {le.owner.firstName} {le.owner.lastName}
                          </Text>
                          <Text
                            fontWeight="semibold"
                            color={
                              selectedChat.participantColor[le.owner.id]
                                .textColor
                            }
                            display={
                              le.owner.id === "665d94824fd179295d788f7d"
                                ? "initial"
                                : "none"
                            }
                            fontSize={"12px"}
                          >
                            You
                          </Text>
                          <Box maxWidth={"85%"} display={"flex"}>
                            <Box display={"flex"} flexDir={"column"}>
                            <Box
                              bgColor={
                                "#E0E0E0"
                              }
                              borderRadius={"6px"}
                              py={"6px"}
                              px={"8px"}
                              display={le.message.split('---')[1] ? "flex" : "none"}
                              mb={"4px"}
                            >
                              <Text
                                color={"#4f4f4f"}
                                fontSize={"12px"}
                                mb={"4px"}
                              >
                                {le.message}
                                {le.message.split("---")[1]}
                              </Text>
                            </Box>
                            <Box display={"flex"} justifyContent={"flex-end"}>
                            <Box
                              display={
                                le.owner.id === "665d94824fd179295d788f7d"
                                  ? "initial"
                                  : "none"
                              }
                              mr={"4px"}
                            >
                              <Popover
                                placement="bottom"
                                closeOnBlur={true}
                                id={`${le.id}`}
                              >
                                <PopoverTrigger>
                                  <Box height={"15px"}>
                                    <Icon as={HiOutlineDotsHorizontal} />
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
                                    borderBottom={"1px solid #bdbdbd"}
                                    width={"100px"}
                                    px={"12px"}
                                    py={"6px"}
                                    _hover={{ cursor: "pointer" }}
                                  >
                                    <Text color={"#2f80ed"} fontSize={"12px"}>
                                      Edit
                                    </Text>
                                  </Box>
                                  <Box
                                    px={"12px"}
                                    py={"6px"}
                                    _hover={{ cursor: "pointer" }}
                                    onClick={() => {
                                      handleDeleteChat(le.id)
                                    }}
                                  >
                                    <Text color={"#eb5757"} fontSize={"12px"}>
                                      Delete
                                    </Text>
                                  </Box>
                                </PopoverContent>
                              </Popover>
                            </Box>
                            <Box
                              bgColor={
                                selectedChat.participantColor[le.owner.id].color
                              }
                              borderRadius={"6px"}
                              py={"6px"}
                              px={"8px"}
                            >
                              <Text
                                color={"#4f4f4f"}
                                fontSize={"12px"}
                                mb={"4px"}
                              >
                                {le.message.split("---")[0]}
                              </Text>
                              <Text color={"#4f4f4f"} fontSize={"10px"}>
                                {moment(le.publishDate).format("HH:mm")}
                              </Text>
                            </Box>
                            </Box>
                            </Box>
                            <Box
                              display={
                                le.owner.id === "665d94824fd179295d788f7d"
                                  ? "none"
                                  : "initial"
                              }
                              ml={"4px"}
                            >
                              <Popover
                                placement="bottom"
                                closeOnBlur={true}
                                id={`${le.id}`}
                              >
                                <PopoverTrigger>
                                  <Box
                                    height={"15px"}
                                    onClick={() => {
                                      // @ts-ignore
                                      const doc = document.getElementById(
                                        `popover-content-${le.id}`
                                      );
                                    }}
                                  >
                                    <Icon as={HiOutlineDotsHorizontal} />
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
                                    borderBottom={"1px solid #bdbdbd"}
                                    width={"100px"}
                                    px={"12px"}
                                    py={"6px"}
                                  >
                                    <Text color={"#2f80ed"} fontSize={"12px"}>
                                      Share
                                    </Text>
                                  </Box>
                                  <Box px={"12px"} py={"6px"} _hover={{cursor: "pointer"}} onClick={() => {
                                    handleReply(le)
                                  }}>
                                    <Text color={"#2f80ed"} fontSize={"12px"}>
                                      Reply
                                    </Text>
                                  </Box>
                                </PopoverContent>
                              </Popover>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                );
              })}
          </Box>
          {!reachBotom && (
            <Box
              position={"sticky"}
              display={"flex"}
              w={"100%"}
              justifyContent={"center"}
            >
              <Tag
                color={"#2F80ED"}
                backgroundColor={"#e9f3ff"}
                px={"8px"}
                py={"4px"}
              >
                New Message
              </Tag>
            </Box>
          )}
          {selectedChat.text === "FastVisa Support" && (
            <Box
              position={"sticky"}
              display={"flex"}
              backgroundColor={"#e9f3ff"}
              mx={"24px"}
              p={"12px"}
              alignItems={"center"}
            >
              <ReactLoading
                type={"spin"}
                color={"#2F80ED"}
                height={"25px"}
                width={"25px"}
              />
              <Text ml={"8px"} color={"#4f4f4f"} fontSize={"12px"}>
                Please wait while we connect you with one of our team ...
              </Text>
            </Box>
          )}
          <Box w={"100%"} height={"60px"} padding={"12px"} display={"flex"}>
            <Box w={"100%"} display={"flex"} flexDir={"column"} position={"relative"}>
              <Box className={repliedChat.message ? "replyingBox show" : "replyingBox"}>
                <Box display={"flex"} alignItems={"center"} justifyContent={"space-between"}>
                  <Text className={repliedChat.message ? "replyingBoxContent show" : "replyingBoxContent"} fontWeight={"semibold"}>Replying to {repliedChat.owner?.firstName} {repliedChat.owner?.lastName}</Text>
                  <Image _hover={{cursor: "pointer"}} onClick={() => setRepliedChat({})} src={closeIcon.src} alt="closeIcon" className={repliedChat.message ? "replyingBoxImage show" : "replyingBoxImage"} />
                </Box>
                <Text className={repliedChat.message ? "replyingBoxContent show" : "replyingBoxContent"}>{repliedChat?.message}</Text>
              </Box>
              <Input placeholder="Type a new message" size={"sm"} mr={"12px"} value={chatReply} onChange={(e) => {setChatReply(e.target.value)}}/>
            </Box>
            <Button
              size={"sm"}
              width={"80px"}
              backgroundColor={"#2f80ed"}
              color={"white"}
              onClick={() => {
                const payload = {
                  id: selectedChat.id,
                  message: repliedChat.message ? `${chatReply}---${repliedChat.message}` : chatReply
                }
                handleSendChat(payload)
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
